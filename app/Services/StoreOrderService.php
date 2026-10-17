<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Variant;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service for creating and managing store orders placed directly via phone or WhatsApp.
 *
 * Distinct from storefront orders (OrderService), which originate from cart sessions.
 * Creates the customer (with or without email), line items with optional customizations,
 * computes totals, assigns delivery zones, and creates a shareable Stripe Payment Link.
 */
class StoreOrderService
{
    public function __construct(
        private StripeService $stripe,
        private DeliveryZoneMatcher $deliveryZoneMatcher,
    ) {}

    /**
     * Create a store order from admin input.
     *
     * @param  array<string, mixed>  $data
     * @param  int|string|null  $adminUserId  ID of the admin user placing the order
     *
     * @throws \Throwable If database transaction fails
     */
    public function createStoreOrder(array $data, int|string|null $adminUserId = null): Order
    {
        return DB::transaction(function () use ($data, $adminUserId): Order {
            /** @var array{first_name: string, last_name: string, phone?: string|null, email?: string|null} $customerData */
            $customerData = $data['customer'];
            $customer = $this->resolveCustomer($customerData);

            // Calculate fulfillment and delivery zone
            /** @var string $fulfillmentType */
            $fulfillmentType = $data['fulfillment_type'];
            /** @var string|null $deliveryPostcode */
            $deliveryPostcode = $data['delivery_postcode'] ?? null;
            $deliveryZone = null;
            $shippingAmount = 0.0;

            if ($fulfillmentType === 'delivery') {
                if ($deliveryPostcode !== null && $deliveryPostcode !== '') {
                    $deliveryZone = $this->deliveryZoneMatcher->find($deliveryPostcode);
                }

                if (isset($data['shipping_amount']) && is_numeric($data['shipping_amount'])) {
                    $shippingAmount = (float) $data['shipping_amount'];
                } elseif ($deliveryZone instanceof DeliveryZone) {
                    $shippingAmount = (float) $deliveryZone->delivery_price;
                }
            }

            // Process items and compute subtotal
            $subtotal = 0.0;
            $hasPreorder = false;
            $itemDetails = [];
            $allInstructions = [];

            foreach ($data['items'] as $itemInput) {
                /** @var Product $product */
                $product = Product::findOrFail($itemInput['product_id']);

                if ($product->preorder) {
                    $hasPreorder = true;
                }

                $variant = null;
                if (! empty($itemInput['variant_id'])) {
                    /** @var Variant $variant */
                    $variant = Variant::where('product_id', $product->id)
                        ->where('id', $itemInput['variant_id'])
                        ->firstOrFail();
                }

                // Determine unit price
                if (isset($itemInput['unit_price']) && is_numeric($itemInput['unit_price'])) {
                    $unitPrice = (float) $itemInput['unit_price'];
                } else {
                    $unitPrice = (float) $product->selling_price;
                    if ($variant instanceof Variant) {
                        $unitPrice += (float) $variant->price_adjustment;
                    }
                }

                $quantity = (float) $itemInput['quantity'];
                $lineTotal = round($unitPrice * $quantity, 4);
                $subtotal += $lineTotal;

                $productName = $variant instanceof Variant && ! empty($variant->name)
                    ? "{$product->name} - {$variant->name}"
                    : $product->name;

                if (! empty($itemInput['instructions'])) {
                    $allInstructions[] = "{$productName}: {$itemInput['instructions']}";
                }

                $itemDetails[] = [
                    'product' => $product,
                    'variant' => $variant,
                    'product_name' => $productName,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'customization_text' => $itemInput['customization_text'] ?? null,
                    'customization_font' => $itemInput['customization_font'] ?? null,
                    'customization_primary_color_id' => $itemInput['customization_primary_color_id'] ?? null,
                    'customization_secondary_color_id' => $itemInput['customization_secondary_color_id'] ?? null,
                ];
            }

            // Build combined notes if per-item instructions exist
            $combinedNotes = $data['notes'] ?? '';
            if ($allInstructions !== []) {
                $instructionsBlock = "Item Instructions:\n".implode("\n", $allInstructions);
                $combinedNotes = $combinedNotes !== ''
                    ? $combinedNotes."\n\n".$instructionsBlock
                    : $instructionsBlock;
            }

            $total = max(0.0, $subtotal + $shippingAmount);

            // Create Order
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $customer->id,
                'status' => $hasPreorder ? 'preorder' : 'pending',
                'order_source' => $data['order_source'],
                'payment_status' => 'unpaid',
                'payment_method' => 'stripe',
                'subtotal' => number_format($subtotal, 4, '.', ''),
                'tax_amount' => '0.0000',
                'discount_amount' => '0.0000',
                'shipping_amount' => number_format($shippingAmount, 4, '.', ''),
                'total' => number_format($total, 4, '.', ''),
                'amount_paid' => '0.0000',
                'notes' => $combinedNotes !== '' ? $combinedNotes : null,
                'fulfillment_type' => $fulfillmentType,
                'expected_at' => CarbonImmutable::parse($data['expected_at']),
                'delivery_zone_id' => $deliveryZone?->id,
                'delivery_postcode' => $deliveryPostcode,
                'shipping_address_line1' => $fulfillmentType === 'delivery' ? ($data['shipping_address_line1'] ?? null) : null,
                'shipping_address_line2' => $fulfillmentType === 'delivery' ? ($data['shipping_address_line2'] ?? null) : null,
                'shipping_city' => $fulfillmentType === 'delivery' ? ($data['shipping_city'] ?? null) : null,
                'created_by' => $adminUserId,
                'placed_at' => now(),
            ]);

            // Create Order Items
            foreach ($itemDetails as $detail) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $detail['product']->id,
                    'variant_id' => $detail['variant']?->id,
                    'product_name' => $detail['product_name'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => number_format($detail['unit_price'], 4, '.', ''),
                    'total' => number_format($detail['line_total'], 4, '.', ''),
                    'status' => 'pending',
                    'customization_text' => $detail['customization_text'],
                    'customization_font' => $detail['customization_font'],
                    'customization_primary_color_id' => $detail['customization_primary_color_id'],
                    'customization_secondary_color_id' => $detail['customization_secondary_color_id'],
                ]);
            }

            // Generate Stripe Payment Link if requested (default true) and total > 0
            $generateLink = $data['generate_payment_link'] ?? true;
            if ($generateLink && $total > 0) {
                $this->generatePaymentLinkForOrder($order, $customer->email);
            }

            return $order;
        });
    }

    /**
     * Generate or refresh the Stripe Payment Link for an order.
     */
    public function generatePaymentLinkForOrder(Order $order, ?string $customerEmail = null): ?string
    {
        $amountPounds = (float) $order->total;
        if ($amountPounds <= 0) {
            return null;
        }

        try {
            $price = $this->stripe->createOneOffPrice(
                $amountPounds,
                "Party Eden Order #{$order->order_number}",
            );

            $email = $customerEmail ?? $order->customer?->email;

            $paymentLink = $this->stripe->createPaymentLink(
                price: $price,
                orderUuid: $order->id,
                customerEmail: $email,
            );

            $order->update([
                'stripe_payment_link_id' => $paymentLink->id,
                'stripe_payment_link_url' => $paymentLink->url,
            ]);

            return $paymentLink->url;
        } catch (\Throwable $e) {
            Log::error('Failed to create Stripe Payment Link for store order', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Resolve or create the customer record.
     *
     * @param  array{
     *     first_name: string,
     *     last_name: string,
     *     phone?: string|null,
     *     email?: string|null,
     * }  $customerData
     */
    private function resolveCustomer(array $customerData): Customer
    {
        $email = ! empty($customerData['email']) ? trim($customerData['email']) : null;
        $phone = ! empty($customerData['phone']) ? trim($customerData['phone']) : null;

        if ($email !== null) {
            /** @var Customer|null $existing */
            $existing = Customer::where('email', $email)->first();
            if ($existing instanceof Customer) {
                $existing->update([
                    'first_name' => $customerData['first_name'],
                    'last_name' => $customerData['last_name'],
                    'phone' => $phone ?? $existing->phone,
                ]);

                return $existing;
            }
        } elseif ($phone !== null) {
            /** @var Customer|null $existingByPhone */
            $existingByPhone = Customer::where('phone', $phone)->first();
            if ($existingByPhone instanceof Customer) {
                $existingByPhone->update([
                    'first_name' => $customerData['first_name'],
                    'last_name' => $customerData['last_name'],
                ]);

                return $existingByPhone;
            }
        }

        /** @var Customer */
        return Customer::create([
            'first_name' => $customerData['first_name'],
            'last_name' => $customerData['last_name'],
            'email' => $email,
            'phone' => $phone,
            'password' => bcrypt('store-order-customer-'.uniqid()),
            'is_active' => true,
        ]);
    }

    /**
     * Generate a unique order number formatted with date and random suffix.
     */
    private function generateOrderNumber(): string
    {
        return 'ORD-'.date('Ymd').'-'.strtoupper(substr(uniqid(), -6));
    }
}
