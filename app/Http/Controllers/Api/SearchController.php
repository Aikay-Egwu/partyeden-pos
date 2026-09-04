<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Search\SearchRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SupplierResource;
use App\Http\Resources\TransactionResource;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class SearchController extends ApiController
{
    public function __invoke(SearchRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', Product::class);

        $query = $request->validated('q');
        $types = $request->validated('types') ?? 'products,customers,suppliers,transactions,orders';
        // Cast after the null-coalesce — casting first would turn a missing limit into 0 (LIMIT 0 = no rows)
        $limit = (int) ($request->validated('limit') ?? 5);
        $searchTypes = explode(',', $types);

        $results = [];

        if (in_array('products', $searchTypes)) {
            $results['products'] = ProductResource::collection(
                Product::where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('sku', 'like', "%{$query}%")
                        ->orWhere('barcode', 'like', "%{$query}%");
                })
                    ->limit($limit)
                    ->get()
            );
        }

        if (in_array('customers', $searchTypes)) {
            $results['customers'] = CustomerResource::collection(
                Customer::where(function ($q) use ($query) {
                    $q->where('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%");
                })
                    ->limit($limit)
                    ->get()
            );
        }

        if (in_array('suppliers', $searchTypes)) {
            $results['suppliers'] = SupplierResource::collection(
                Supplier::where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('code', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                })
                    ->limit($limit)
                    ->get()
            );
        }

        if (in_array('transactions', $searchTypes)) {
            $results['transactions'] = TransactionResource::collection(
                Transaction::where('transaction_number', 'like', "%{$query}%")
                    ->limit($limit)
                    ->get()
            );
        }

        if (in_array('orders', $searchTypes)) {
            $results['orders'] = OrderResource::collection(
                Order::where('order_number', 'like', "%{$query}%")
                    ->limit($limit)
                    ->get()
            );
        }

        return response()->json(['data' => $results]);
    }
}
