<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Http\Resources\TransactionResource;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Staff::class);

        $staff = Staff::query()
            ->when($request->input('role'), fn ($q, $r) => $q->where('role', $r))
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->when($request->input('search'), fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('employee_code', 'like', "%{$s}%");
            }))
            ->with('user')
            ->withCount(['tillSessions', 'transactions'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return StaffResource::collection($staff);
    }

    public function store(StoreStaffRequest $request): StaffResource
    {
        $this->authorize('create', Staff::class);

        $member = Staff::create($request->validated());

        return new StaffResource($member->load('user')->loadCount(['tillSessions', 'transactions']));
    }

    public function show(Staff $staff): StaffResource
    {
        $this->authorize('view', $staff);

        $staff->load('user')->loadCount(['tillSessions', 'transactions']);

        return new StaffResource($staff);
    }

    public function update(UpdateStaffRequest $request, Staff $staff): StaffResource
    {
        $this->authorize('update', $staff);

        $staff->update($request->validated());

        return new StaffResource($staff->load('user')->loadCount(['tillSessions', 'transactions']));
    }

    public function destroy(Staff $staff): JsonResponse
    {
        $this->authorize('delete', $staff);

        $staff->delete();

        return $this->respondDeleted('Staff member');
    }

    public function deactivate(Staff $staff): StaffResource
    {
        $this->authorize('update', $staff);

        $staff->update([
            'is_active' => false,
            'termination_date' => now(),
        ]);

        return new StaffResource($staff->load('user')->loadCount(['tillSessions', 'transactions']));
    }

    public function salesReport(Request $request, Staff $staff): JsonResponse
    {
        $this->authorize('view', $staff);

        $stats = $staff->transactions()
            ->where('status', 'completed')
            ->dateRange($request->input('from'), $request->input('to'))
            ->selectRaw('COUNT(*) as total_transactions, SUM(total) as total_sales, SUM(tax_amount) as total_tax')
            ->first();

        return response()->json([
            'data' => [
                'staff' => new StaffResource($staff),
                'total_transactions' => (int) $stats->total_transactions,
                'total_sales' => (float) $stats->total_sales,
                'total_tax' => (float) $stats->total_tax,
            ],
        ]);
    }

    public function transactions(Request $request, Staff $staff): JsonResource
    {
        $this->authorize('view', $staff);

        $transactions = $staff->transactions()
            ->dateRange($request->input('from'), $request->input('to'))
            ->with(['customer', 'location'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return TransactionResource::collection($transactions);
    }
}
