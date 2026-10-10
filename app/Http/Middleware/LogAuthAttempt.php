<?php

namespace App\Http\Middleware;

use App\Models\AuthAttemptLog;
use App\Models\Customer;
use App\Models\User;
use App\Services\Analytics\UserAgentParser;
use Closure;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

/**
 * Logs every login POST request to auth_attempt_logs for audit purposes.
 *
 * Runs on ALL web requests (added to the global web middleware stack) but
 * short-circuits quickly unless this is a POST login attempt. Running it
 * globally means we do not need to modify or override Fortify's route
 * registration.
 *
 * CRITICAL: the actual log is written from terminate() instead of handle().
 * This is because the throttle middleware does not return a normal 429
 * Response — it throws a ThrottleRequestsException which bubbles out of the
 * middleware stack, skipping every handle() method's post-$next() code.
 * terminate() runs after the exception handler renders the final response,
 * so throttled (429) attempts, validation failures, and SUCCESS logins are
 * all captured identically.
 *
 * Outcome classification:
 *   - Auth::check() true          → SUCCESS
 *   - Response status 429         → FAIL / throttled
 *   - Otherwise (not authed)      → FAIL / invalid_credentials
 *
 * On FAIL we still resolve user_type / user_id by looking up the submitted
 * email across BOTH tables. This is safe because the lookup never reaches
 * the HTTP response — Fortify guarantees a byte-identical generic error
 * message regardless of whether the email exists in either table.
 */
class LogAuthAttempt
{
    /**
     * Pass-through — all detection + logging happens in terminate().
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /**
     * Terminate runs after the response has been sent (or after the
     * exception handler rendered one). This is the only reliable place to
     * catch throttled attempts alongside normal successes and failures.
     */
    public function terminate(Request $request, Response $response): void
    {
        if (! $this->isLoginAttempt($request)) {
            return;
        }

        $this->writeLog($request, $response);
    }

    /**
     * Decide whether a request is a login POST attempt.
     *
     * Detection is primarily by the POST input signature (username + password
     * fields) because this is invariant across route renames and custom URLs.
     * As a fallback we also accept the /login path so empty/malformed POSTs
     * with missing fields still get recorded.
     */
    private function isLoginAttempt(Request $request): bool
    {
        if (! $request->isMethod('POST')) {
            return false;
        }

        $hasUsername = $request->has(Fortify::username());
        $hasPassword = $request->has('password');

        if ($hasUsername && $hasPassword) {
            return true;
        }

        $isLoginPath = $request->path() === 'login' || $request->is('login');
        $route = $request->route();
        $isLoginRoute = $route !== null && (
            $request->routeIs('login') || $request->routeIs('login.store')
        );

        return $isLoginPath || $isLoginRoute;
    }

    /**
     * Write a single AuthAttemptLog row based on the final request + response state.
     */
    private function writeLog(Request $request, Response $response): void
    {
        /** @var string|null $email */
        $email = $request->input(Fortify::username());

        // Parse user agent (browser / os / device_type) once.
        $uaInfo = (new UserAgentParser)->parse($request->userAgent() ?? '');

        // Determine outcome and reason.
        $authenticated = Auth::check();
        $outcome = $authenticated ? 'SUCCESS' : 'FAIL';
        $reason = $this->resolveReason($response, $authenticated);

        // Resolve user_type and user_id.
        ['user_type' => $userType, 'user_id' => $userId] = $this->resolveUserIdentity(
            $request,
            $authenticated,
        );

        // Persist the audit row. We never throw from here — an audit logger
        // failing must never prevent the user from logging in or receiving
        // the correct error response.
        try {
            AuthAttemptLog::query()->create([
                'email' => (string) $email,
                'ip_address' => $request->ip(),
                'browser' => $uaInfo['browser'],
                'os' => $uaInfo['os'],
                'device_type' => $uaInfo['device_type'],
                'outcome' => $outcome,
                'reason' => $reason,
                'user_type' => $userType,
                'user_id' => $userId,
            ]);
        } catch (\Throwable $e) {
            // Swallow — audit log failure must not surface to the user.
            report($e);
        }
    }

    /**
     * Resolve the failure reason string (or null for SUCCESS).
     */
    private function resolveReason(Response $response, bool $authenticated): ?string
    {
        if ($authenticated) {
            return null;
        }

        if ($response->getStatusCode() === Response::HTTP_TOO_MANY_REQUESTS) {
            return 'throttled';
        }

        return 'invalid_credentials';
    }

    /**
     * Resolve user_type + user_id for the log entry.
     *
     * On SUCCESS we trust the currently-authenticated user's getAuthRole().
     * On FAIL we look up the submitted email across both tables so the audit
     * log can tell admins whether a known account was targeted or a random
     * spray-and-pray attempt. This info never leaks to the HTTP response.
     *
     * @return array{user_type: string|null, user_id: string|null}
     */
    private function resolveUserIdentity(Request $request, bool $authenticated): array
    {
        if ($authenticated) {
            /** @var Authenticatable|null $user */
            $user = Auth::user();
            if ($user === null) {
                return ['user_type' => null, 'user_id' => null];
            }

            $role = method_exists($user, 'getAuthRole') ? $user->getAuthRole() : null;
            $id = $user->getAuthIdentifier();

            return [
                'user_type' => is_string($role) ? $role : null,
                'user_id' => is_string($id) || is_int($id) ? (string) $id : null,
            ];
        }

        /** @var string|null $email */
        $email = $request->input(Fortify::username());
        if ($email === null || $email === '') {
            return ['user_type' => 'unknown', 'user_id' => null];
        }

        // FAIL path: look up in User first, then Customer.
        $adminUser = User::query()
            ->where(Fortify::username(), $email)
            ->first();

        if ($adminUser !== null) {
            $id = $adminUser->getAuthIdentifier();

            return [
                'user_type' => 'admin',
                'user_id' => is_string($id) || is_int($id) ? (string) $id : null,
            ];
        }

        $customer = Customer::query()
            ->where(Fortify::username(), $email)
            ->first();

        if ($customer !== null) {
            $id = $customer->getAuthIdentifier();

            return [
                'user_type' => 'customer',
                'user_id' => is_string($id) || is_int($id) ? (string) $id : null,
            ];
        }

        return ['user_type' => 'unknown', 'user_id' => null];
    }
}
