<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends BaseController
{
    /**
     * Display a listing of the users.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $params = $this->getPaginationParams($request);
        
        $query = User::query();
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        // Order results
        $query->orderBy($params['sort_by'], $params['sort_order']);
        
        $users = $query->paginate($params['per_page']);
        
        return $this->sendResponse($users, 'Users retrieved successfully');
    }

    /**
     * Store a newly created user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'profession' => 'nullable|string|max:100',
            'company' => 'nullable|string|max:100',
            'role' => 'required|in:admin,member,blog_manager',
            'status' => 'required|in:active,inactive,pending',
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
            'role' => $request->role,
            'status' => $request->status,
        ]);

        return $this->sendResponse($user, 'User created successfully', 201);
    }

    /**
     * Display the specified user.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = User::find($id);

        if (is_null($user)) {
            return $this->sendError('User not found');
        }

        return $this->sendResponse($user, 'User retrieved successfully');
    }

    /**
     * Update the specified user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (is_null($user)) {
            return $this->sendError('User not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'profession' => 'nullable|string|max:100',
            'company' => 'nullable|string|max:100',
            'role' => 'sometimes|in:admin,member,blog_manager',
            'status' => 'sometimes|in:active,inactive,pending',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $updateData = $request->only(['name', 'email', 'phone', 'profession', 'company', 'role', 'status']);
        
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }
        
        $user->update($updateData);

        return $this->sendResponse($user, 'User updated successfully');
    }

    /**
     * Update the specified user's status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive,pending',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $user = User::find($id);

        if (is_null($user)) {
            return $this->sendError('User not found');
        }

        $user->status = $request->status;
        $user->save();

        return $this->sendResponse($user, 'User status updated successfully');
    }

    /**
     * Remove the specified user from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (is_null($user)) {
            return $this->sendError('User not found');
        }

        // Prevent deleting the last admin
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return $this->sendError('Cannot delete the last admin user', [], 422);
        }

        $user->delete();

        return $this->sendResponse([], 'User deleted successfully');
    }

    /**
     * Get the current authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function currentUser(Request $request)
    {
        return $this->sendResponse($request->user(), 'Current user retrieved successfully');
    }

    /**
     * Get user statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $inactiveUsers = User::where('status', 'inactive')->count();
        $pendingUsers = User::where('status', 'pending')->count();
        $adminUsers = User::where('role', 'admin')->count();
        $memberUsers = User::where('role', 'member')->count();

        return $this->sendResponse([
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'pending_users' => $pendingUsers,
            'admin_users' => $adminUsers,
            'member_users' => $memberUsers,
        ], 'User statistics retrieved successfully');
    }

    /**
     * Public listing of active members for directory.
     * No authentication required - for public Rotary Club directory.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function publicIndex(Request $request)
    {
        $params = $this->getPaginationParams($request);

        $query = User::query()
            ->where('status', 'active') // Only show active members
            ->where('role', 'member') // Only show members (not admins)
            ->select(['id', 'name', 'profession', 'company', 'phone', 'created_at', 'role', 'status']); // Hide sensitive fields like email

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('profession', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Order by name for consistent display
        $query->orderBy('name', 'asc');

        $members = $query->paginate($params['per_page']);

        return $this->sendResponse($members, 'Public members directory retrieved successfully');
    }
}
