<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for managing administrator accounts (the `users` table).
 * Admin status is stored in the `permissions` JSON column via the 'admin' flag.
 */
class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when(
                $request->search,
                fn ($q, $s) => $q
                    ->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
            )
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => $this->transform($user));

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => null,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'permissions' => $this->resolvePermissions([], (bool) ($data['is_admin'] ?? false)),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => $this->transform($user),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        $user->name = $data['name'] ?? $user->name;
        $user->email = $data['email'] ?? $user->email;

        // Only change the password when a new one was supplied.
        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }

        if (array_key_exists('is_admin', $data)) {
            $user->permissions = $this->resolvePermissions(
                $user->permissions ?? [],
                (bool) $data['is_admin']
            );
        }

        $user->save();

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Prevent an admin from deleting their own account and losing access.
        if ($user->is($request->user())) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Shape a user for the frontend, exposing the derived is_admin flag
     * and never the password or secrets.
     *
     * @return array<string, mixed>
     */
    private function transform(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $user->hasPermission('admin'),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }

    /**
     * Add or remove the 'admin' permission while preserving any other entries.
     *
     * @param  array<int, string>  $current
     * @return array<int, string>
     */
    private function resolvePermissions(array $current, bool $isAdmin): array
    {
        $permissions = array_values(array_filter(
            $current,
            fn ($permission) => $permission !== 'admin'
        ));

        if ($isAdmin) {
            $permissions[] = 'admin';
        }

        return $permissions;
    }
}
