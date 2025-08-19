<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseController
{
    /**
     * Register a new user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'profession' => 'nullable|string|max:100',
            'company' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'profession' => $request->profession,
            'company' => $request->company,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->sendResponse([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully', 201);
    }

    /**
     * Login user and create token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember_me' => 'boolean'
        ]);

        // Check if user exists with this email
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return $this->sendError('Unauthorized', ['error' => 'this user does not exist'], 401);
        }

        // Check if password is correct
        if (!Hash::check($credentials['password'], $user->password)) {
            return $this->sendError('Unauthorized', ['error' => 'incorrect password'], 401);
        }

        // Check if account is active
        if ($user->status !== 'active') {
            return $this->sendError('Account Inactive', ['error' => 'Your account is not active'], 403);
        }

        // Create authentication token
        Auth::login($user);
        $tokenResult = $user->createToken('auth_token');
        $token = $tokenResult->plainTextToken;
        $expirationMinutes = config('sanctum.expiration') ?: (60 * 24 * 30); // 30 days default
        $expiresAt = now()->addMinutes($expirationMinutes);

        return $this->sendResponse([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toDateTimeString(),
        ], 'Login successful');
    }

    /**
     * Logout user (Revoke the token).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->sendResponse([], 'Successfully logged out');
    }

    /**
     * Get the authenticated User.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        return $this->sendResponse($request->user(), 'User retrieved successfully');
    }

    /**
     * Send password reset link.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? $this->sendResponse([], __($status))
            : $this->sendError('Unable to send reset link', ['email' => __($status)], 422);
    }

    /**
     * Reset password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? $this->sendResponse([], __($status))
            : $this->sendError('Unable to reset password', ['email' => __($status)], 422);
    }

    /**
     * Update user profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'profession' => 'nullable|string|max:100',
            'company' => 'nullable|string|max:100',
            'current_password' => 'required_with:new_password',
            'new_password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        // Update basic info
        $user->fill($request->only(['name', 'email', 'phone', 'profession', 'company']));

        // Update password if provided
        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return $this->sendError('Current password is incorrect', [], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        return $this->sendResponse($user, 'Profile updated successfully');
    }

    /**
     * Update user avatar.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();
        
        // Delete old avatar if exists
        if ($user->avatar_url) {
            $oldAvatarPath = str_replace(url('/storage'), 'public', $user->avatar_url);
            if (Storage::exists($oldAvatarPath)) {
                Storage::delete($oldAvatarPath);
            }
        }

        // Store new avatar
        $path = $request->file('avatar')->store('public/avatars');
        $user->avatar_url = Storage::url($path);
        $user->save();

        return $this->sendResponse([
            'avatar_url' => $user->avatar_url
        ], 'Avatar updated successfully');
    }
}
