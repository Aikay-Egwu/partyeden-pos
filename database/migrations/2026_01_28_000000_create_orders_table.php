<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Customer orders (online or phone) for delivery or collection.
     *
     * Separate from POS transactions. Tracks order status, payment status,
     * financial breakdown, and shipping/billing addresses.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->foreignUuid('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('status')->default('pending')->comment('pending, confirmed, processing, shipped, delivered, cancelled');
            $table->string('payment_status')->default('unpaid')->comment('unpaid, partial, paid, refunded');
            $table->decimal('subtotal', 12, 4)->default(0);
            $table->decimal('tax_amount', 12, 4)->default(0);
            $table->decimal('discount_amount', 12, 4)->default(0);
            $table->decimal('shipping_amount', 12, 4)->default(0);
            $table->decimal('total', 12, 4)->default(0);
            $table->foreignUuid('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('shipping_address')->nullable();
            $table->string('billing_address')->nullable();
            $table->text('notes')->nullable();
            $table->string('fulfillment_type')->default('pickup')
                ->comment('pickup, delivery');
            $table->foreignId('delivery_zone_id')->nullable()
                ->constrained('delivery_zones')->nullOnDelete()
                ->comment('Matched delivery zone from postcode lookup');
            $table->string('delivery_postcode')->nullable()
                ->comment('Customer-entered postcode for zone matching');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('placed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('customer_id');
            $table->index('status');
            $table->index('order_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
