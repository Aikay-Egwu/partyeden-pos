<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminFaqController extends Controller
{
    public function index(Request $request): Response
    {
        $faqs = Faq::query()
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')->toString()))
            ->when($request->filled('visibility'), fn ($query) => $query->where('is_visible', $request->string('visibility')->toString() === 'visible'))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();
                $query->where(fn ($nested) => $nested
                    ->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%"));
            })
            ->orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('question')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/faqs/index', [
            'faqs' => $faqs,
            'filters' => $request->only(['search', 'category', 'visibility']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/faqs/form', ['faq' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        Faq::create($this->validatedData($request));

        return redirect()->route('faqs.index')->with('success', 'FAQ created successfully.');
    }

    public function edit(Faq $faq): Response
    {
        return Inertia::render('admin/faqs/form', ['faq' => $faq]);
    }

    public function update(Request $request, Faq $faq): RedirectResponse
    {
        $faq->update($this->validatedData($request));

        return redirect()->route('faqs.index')->with('success', 'FAQ updated successfully.');
    }

    public function updateVisibility(Request $request, Faq $faq): RedirectResponse
    {
        $data = $request->validate([
            'is_visible' => ['required', 'boolean'],
        ]);

        $faq->update($data);

        return back()->with('success', $faq->is_visible ? 'FAQ is now visible.' : 'FAQ has been hidden.');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        return redirect()->route('faqs.index')->with('success', 'FAQ deleted successfully.');
    }

    /**
     * @return array{question: string, answer: string, category: string, sort_order: int, is_visible: bool}
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:20000'],
            'category' => ['required', 'in:winter,summer,general'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'is_visible' => ['required', 'boolean'],
        ]);
    }
}
