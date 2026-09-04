<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

abstract class ApiController extends Controller
{
    protected function respondDeleted(string $resource = 'Resource'): JsonResponse
    {
        return response()->json(['message' => "{$resource} deleted successfully."]);
    }

    protected function respondNoContent(): Response
    {
        return response()->noContent();
    }
}
