<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Actions\Customer\CreateNewCustomer;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class CustomerRegisterController extends Controller
{
    /**
     * Human-readable password requirements shown as a list below the password
     * field. These match the Password validation rules applied at runtime:
     * a minimum length of 8 characters in local/CI environments, plus stronger
     * mixed-case/number/symbol rules when deployed to production (enforced by
     * Password::defaults() in AppServiceProvider).
     *
     * @return list<string>
     */
    private function passwordRulesList(): array
    {
        $rules = [
            'At least 8 characters long',
        ];

        if (app()->isProduction()) {
            $rules[] = 'At least one uppercase and one lowercase letter';
            $rules[] = 'At least one number (0–9)';
            $rules[] = 'At least one symbol (!@#$%^&*)';
            $rules[] = 'Must not appear in a known data breach';
        }

        return $rules;
    }

    /**
     * Show the customer registration form.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/register', [
            // Plain list of human-readable password requirements (rendered as
            // a bulleted list in the UI — avoids showing the raw "minlength:
            // 8; required: digit" format produced by toPasswordRulesString()).
            'passwordRulesList' => $this->passwordRulesList(),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming customer registration request.
     */
    public function store(Request $request, CreateNewCustomer $action): RedirectResponse
    {
        $action->create($request->all());

        return redirect()->route('login')->with('status', __('Registration successful! Please check your email to verify your email address.'));
    }
}
