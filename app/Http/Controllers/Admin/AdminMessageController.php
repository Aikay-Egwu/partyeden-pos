<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ContactReplyMail;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AdminMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $messages = Message::query()
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();
                $query->where(fn ($nested) => $nested
                    ->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/messages/index', [
            'messages' => $messages,
            'filters' => $request->only(['search', 'status']),
            'unreadCount' => Message::query()->where('status', 'new')->count(),
        ]);
    }

    public function show(Message $message): Response
    {
        $message->markAsRead();

        return Inertia::render('admin/messages/show', [
            'message' => $message,
        ]);
    }

    public function reply(Request $request, Message $message): RedirectResponse
    {
        $request->validate([
            'reply' => ['required', 'string', 'max:10000'],
        ]);

        $message->update([
            'admin_reply' => $request->string('reply')->toString(),
            'status' => 'replied',
            'replied_at' => now(),
        ]);

        Mail::to($message->email)->send(new ContactReplyMail($message));

        return redirect()->route('messages.show', $message)
            ->with('success', 'Reply sent successfully.');
    }

    public function updateStatus(Request $request, Message $message): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:new,read,replied,archived'],
        ]);

        $message->update([
            'status' => $request->string('status')->toString(),
            'read_at' => $request->string('status')->toString() !== 'new' ? now() : null,
        ]);

        return back()->with('success', 'Message status updated.');
    }

    public function destroy(Message $message): RedirectResponse
    {
        $message->delete();

        return redirect()->route('messages.index')->with('success', 'Message deleted successfully.');
    }
}
