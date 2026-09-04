<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_id' => $this->customer_id,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'paypal_order_id' => $this->paypal_order_id,
            'paypal_capture_id' => $this->paypal_capture_id,
            'paypal_payer_email' => $this->paypal_payer_email,
            'paypal_payer_id' => $this->paypal_payer_id,
            'amount_paid' => $this->amount_paid,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'discount_amount' => $this->discount_amount,
            'shipping_amount' => $this->shipping_amount,
            'total' => $this->total,
            'location_id' => $this->location_id,
            'shipping_address' => $this->shipping_address,
            'billing_address' => $this->billing_address,
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'placed_at' => $this->placed_at?->toIso8601String(),
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'created_by_user' => UserResource::make($this->whenLoaded('createdBy')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'shipments' => ShipmentResource::collection($this->whenLoaded('shipments')),
            'stock_reservations' => StockReservationResource::collection($this->whenLoaded('stockReservations')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
