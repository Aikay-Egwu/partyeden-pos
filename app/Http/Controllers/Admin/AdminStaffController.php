<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;
use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Staff CRUD.
 */
class AdminStaffController extends Controller
{
    public function index(Request $request): Response
    {
        $staff = Staff::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('employee_code', 'like', "%{$s}%");
            }))
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->when($request->filled('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->with('user')
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/staff/index', [
            'staff' => $staff,
            'filters' => $request->only(['search', 'role', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/staff/form', ['staffMember' => null]);
    }

    public function store(StoreStaffRequest $request)
    {
        Staff::create($request->validated());

        return redirect()->route('staff.index')
            ->with('success', 'Staff member created successfully.');
    }

    public function edit(Staff $staff): Response
    {
        return Inertia::render('admin/staff/form', ['staffMember' => $staff]);
    }

    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        $staff->update($request->validated());

        return redirect()->route('staff.index')
            ->with('success', 'Staff member updated successfully.');
    }

    public function destroy(Staff $staff)
    {
        $staff->delete();

        return redirect()->route('staff.index')
            ->with('success', 'Staff member deleted successfully.');
    }
}
