<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Requests\Transaction\VoidTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Transaction::class);

        $transactions = Transaction::query()
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('staff_id'), fn ($q, $id) => $q->where('staff_id', $id))
            ->when($request->input('customer_id'), fn ($q, $id) => $q->where('customer_id', $id))
            ->when($request->input('location_id'), fn ($q, $id) => $q->where('location_id', $id))
            ->dateRange($request->input('from'), $request->input('to'))
            ->when($request->input('search'), fn ($q, $s) => $q->where('transaction_number', 'like', "%{$s}%"))
            ->with(['staff', 'customer', 'location'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return TransactionResource::collection($transactions);
    }

    public function store(StoreTransactionRequest $request): TransactionResource
    {
        $this->authorize('create', Transaction::class);

        $data = $request->validated();
        $items = $data['items'];
        $payments = $data['payments'];
        unset($data['items'], $data['payments']);

        $transaction = DB::transaction(function () use ($data, $items, $payments) {
            $data['transaction_number'] = 'TXN-'.strtoupper(Str::random(12)).'-'.now()->format('Ymd');
            $data['status'] = 'completed';

            $transaction = Transaction::create($data);

            foreach ($items as $item) {
                $transaction->items()->create($item);
            }

            foreach ($payments as $payment) {
                $payment['status'] = 'completed';
                $transaction->payments()->create($payment);
            }

            return $transaction;
        });

        return new TransactionResource(
            $transaction->load(['staff', 'customer', 'location', 'discount', 'items', 'payments'])
        );
    }

    public function show(Transaction $transaction): TransactionResource
    {
        $this->authorize('view', $transaction);

        $transaction->load([
            'staff', 'customer', 'location', 'tillSession', 'discount',
            'items.product', 'items.variant', 'payments', 'return',
        ]);

        return new TransactionResource($transaction);
    }

    public function void(VoidTransactionRequest $request, Transaction $transaction): TransactionResource
    {
        $this->authorize('void', $transaction);

        $transaction->update([
            'status' => 'voided',
            'notes' => ($transaction->notes ? $transaction->notes."\n\n" : '').'VOIDED: '.$request->validated('reason'),
        ]);

        return new TransactionResource($transaction->load(['staff', 'customer', 'location']));
    }

    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Transaction::class);

        $period = $request->input('period', 'daily');
        $query = Transaction::where('status', 'completed');

        $groupExpression = match ($period) {
            'daily' => 'DATE(created_at)',
            'weekly' => 'YEARWEEK(created_at)',
            'monthly' => "DATE_FORMAT(created_at, '%Y-%m')",
            default => 'DATE(created_at)',
        };

        $results = $query
            ->dateRange($request->input('from'), $request->input('to'))
            ->when($request->input('location_id'), fn ($q, $id) => $q->where('location_id', $id))
            ->selectRaw("
                {$groupExpression} as period,
                COUNT(*) as transaction_count,
                SUM(total) as total_sales,
                SUM(tax_amount) as total_tax,
                SUM(discount_amount) as total_discounts
            ")
            ->groupByRaw($groupExpression)
            ->orderByRaw($groupExpression)
            ->get();

        return response()->json(['data' => $results, 'period' => $period]);
    }
}
