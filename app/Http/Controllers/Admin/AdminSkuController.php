<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class AdminSkuController extends Controller
{
    /**
     * Return the next available SKU as JSON.
     * Called by the product form's "Generate SKU" button.
     */
    public function generate(): JsonResponse
    {
        return response()->json(['sku' => Product::generateNextSku()]);
    }
}
