<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\NewOrderAdminMail;
use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Queued job that sends the customer confirmation email and
 * the admin new-order notification after an order is placed.
 * Running asynchronously ensures the checkout response is fast.
 */
class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function handle(): void
    {
        // Load relations needed by the email templates
        $this->order->loadMissing([
            'customer',
            'items.product',
            'items.customizationPrimaryColor',
            'items.customizationSecondaryColor',
            'deliveryZone',
        ]);

        // Send confirmation to the customer (if they provided an email)
        $customerEmail = $this->order->customer?->email;
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new OrderConfirmationMail($this->order));
        }

        // Send new-order alert to the admin team.
        // Admin accounts are User records that pass the 'admin' permission check
        // (explicit 'admin' or '*' wildcard) — the same rule used by the can:admin
        // gate. Customers live in a separate model, so they are never included here.
        $admins = User::all()
            ->filter(fn (User $user) => $user->hasPermission('admin'));

        foreach ($admins as $admin) {
            Mail::to($admin->email)->send(new NewOrderAdminMail($this->order));
        }
        /* $adminEmail = config('mail.admin_email');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new NewOrderAdminMail($this->order));
        } */
    }
}
