<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ContactFormRequest;
use App\Mail\ContactAcknowledgementMail;
use App\Mail\NewMessageNotificationMail;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class StoreContactController extends Controller
{
    public function store(ContactFormRequest $request): RedirectResponse
    {
        $message = Message::create([
            'first_name' => $request->validated('first_name'),
            'last_name' => $request->validated('last_name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'event_type' => $request->validated('event_type'),
            'event_date' => $request->validated('event_date'),
            'message' => $request->validated('message'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'new',
        ]);

        Mail::to($message->email)->send(new ContactAcknowledgementMail($message));

        $adminEmails = User::query()->pluck('email')->all();
        foreach ($adminEmails as $adminEmail) {
            Mail::to($adminEmail)->send(new NewMessageNotificationMail($message));
        }

        return redirect()
            ->route('store.contact')
            ->with('success', 'Your message has been sent! We\'ll get back to you soon.');
    }
}
