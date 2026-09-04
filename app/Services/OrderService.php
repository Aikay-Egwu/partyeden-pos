<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\DeliveryZone;
use App\Models\LoyaltyAccount;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

/**
 * Shared order-creation logic for the storefront.
 *
 * Both checkout paths (pay-later in StoreOrderController and PayPal capture
 * in StorePaymentController) build orders identically: upsert the customer,
 * generate an order number, snapshot cart items (including add-ons), and
 * apply loyalty redemption/earning. Keeping this in one place prevents the
 * two paths from drifting apart on totals, loyalty, or item handling.
 */
final class OrderService
{
    public function __construct(
        private LoyaltyService $loyalty,
    ) {}

    /**
     * Create the customer, order, and order items in a single transaction.
     *
     * @param  array<string, mixed>  $cartContents  Output of CartService::contents()
     * @param  array{email: string, first_name: string, last_name: string, phone: ?string}  $customerData
     * @param  array{amount: float, points: float}  $loyaltyRedemption  Output of LoyaltyService::redemptionPreview()
     * @param  array<string, mixed>  $paymentAttributes  Payment-path specific order columns
     *                                                   (payment_status, paypal_* fields, amount_paid, paid_at, …)
     * @param  array{line1: ?string, line2: ?string, city: ?string}|null  $shippingAddress  Structured delivery address
     *
     * @throws \Throwable When any part of order creation fails (transaction is rolled back)
     */
    public function createFromCart(
        array $cartContents,
        array $customerData,
        string $fulfillmentType,
        ?DeliveryZone $deliveryZone,
        ?string $deliveryPostcode,
        string $shippingAmount,
        ?string $notes,
        ?LoyaltyAccount $loyaltyAccount,
        array $loyaltyRedemption,
        array $paymentAttributes = [],
        ?array $shippingAddress = null,
    ): Order {
        return DB::transaction(function () use (
            $cartContents,
            $customerData,
            $fulfillmentType,
            $deliveryZone,
            $deliveryPostcode,
            $shippingAmount,
            $notes,
            $loyaltyAccount,
            $loyaltyRedemption,
            $paymentAttributes,
            $shippingAddress,
        ): Order {
            // Create or find customer by email
            $customer = Customer::firstOrCreate(
                ['email' => $customerData['email']],
                [
                    'first_name' => $customerData['first_name'],
                    'last_name' => $customerData['last_name'],
                    'phone' => $customerData['phone'],
                    'is_active' => true,
                ],
            );

            // Detect preorder: any item whose product has preorder=true marks the whole order
            $hasPreorderItem = false;
            foreach ($cartContents['items'] as $cartItem) {
                if (! empty($cartItem['preorder'])) {
                    $hasPreorderItem = true;
                    break;
                }
            }

            $order = Order::create(array_merge([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $customer->id,
                'status' => $hasPreorderItem ? 'preorder' : 'pending',
                'payment_status' => 'unpaid',
                'subtotal' => $cartContents['total'],
                'tax_amount' => '0',
                'discount_amount' => (string) $loyaltyRedemption['amount'],
                'loyalty_points_redeemed' => (string) $loyaltyRedemption['points'],
                'loyalty_points_earned' => '0',
                'shipping_amount' => $shippingAmount,
                'total' => (string) max(
                    ((float) $cartContents['total'] + (float) $shippingAmount) - $loyaltyRedemption['amount'],
                    0,
                ),
                'notes' => $notes,
                'fulfillment_type' => $fulfillmentType,
                'delivery_zone_id' => $deliveryZone?->id,
                'delivery_postcode' => $deliveryPostcode,
                'shipping_address_line1' => $shippingAddress['line1'] ?? null,
                'shipping_address_line2' => $shippingAddress['line2'] ?? null,
                'shipping_city' => $shippingAddress['city'] ?? null,
                'placed_at' => now(),
            ], $paymentAttributes));

            // Create order items from cart, with add-ons as child rows
            foreach ($cartContents['items'] as $item) {
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'product_name' => $item['variant_name']
                        ? $item['name'].' - '.$item['variant_name']
                        : $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total' => $item['line_total'],
                    'status' => 'pending',
                    // Persist customization choices from cart
                    'customization_text' => $item['customization_text'] ?? null,
                    'customization_font' => $item['customization_font'] ?? null,
                    'customization_primary_color_id' => $item['customization_primary_color_id'] ?? null,
                    'customization_secondary_color_id' => $item['customization_secondary_color_id'] ?? null,
                ]);

                foreach ($item['add_ons'] ?? [] as $addOn) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'parent_order_item_id' => $orderItem->id,
                        'product_id' => $addOn['id'],
                        'variant_id' => null,
                        'product_name' => $addOn['name'],
                        'quantity' => $addOn['quantity'],
                        'unit_price' => $addOn['price'],
                        'total' => $addOn['line_total'],
                        'status' => 'pending',
                    ]);
                }
            }

            if ($loyaltyAccount instanceof LoyaltyAccount && $loyaltyRedemption['points'] > 0) {
                $this->loyalty->applyRedemption($loyaltyAccount, $order, $loyaltyRedemption['points']);
            }

            $this->loyalty->awardForOrder($order);

            return $order;
        });
    }

    /**
     * Generate a unique, human-readable order number.
     */
    private function generateOrderNumber(): string
    {
        return 'ORD-'.date('Ymd').'-'.strtoupper(substr(uniqid(), -6));
    }
}
