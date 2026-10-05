<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Inertia\Inertia;
use Inertia\Response;

class StoreFaqController extends Controller
{
    public function index(): Response
    {
        $faqs = Faq::query()
            ->visible()
            ->orderBy('sort_order')
            ->orderBy('question')
            ->get(['id', 'question', 'answer', 'category'])
            ->groupBy('category')
            ->map(fn ($items) => $items->values())
            ->all();

        return Inertia::render('store/faqs/index', [
            'faqs' => [
                'winter' => $faqs['winter'] ?? [],
                'summer' => $faqs['summer'] ?? [],
                'general' => $faqs['general'] ?? [],
            ],
        ]);
    }
}
