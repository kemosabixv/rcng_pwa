<?php

namespace App\Http\Controllers\Api;

use App\Models\Committee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CommitteeController extends BaseController
{
    /**
     * Display a listing of the committees.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $params = $this->getPaginationParams($request);
        
        $query = Committee::with(['chairperson', 'members']);
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by chairperson
        if ($request->has('chairperson_id')) {
            $query->where('chairperson_id', $request->chairperson_id);
        }
        
        // Order results
        $query->orderBy($params['sort_by'], $params['sort_order']);
        
        $committees = $query->paginate($params['per_page']);
        
        return $this->sendResponse($committees, 'Committees retrieved successfully');
    }

    /**
     * Store a newly created committee in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'chairperson_id' => 'required|exists:users,id',
            'meeting_schedule' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        // Ensure the chairperson is a member of the committee
        $chairperson = User::findOrFail($request->chairperson_id);
        
        DB::beginTransaction();
        
        try {
            $committee = Committee::create($request->all());
            
            // Add chairperson as a member with 'member' role (role is managed separately from chairperson_id)
            $committee->members()->attach($request->chairperson_id, [
                'role' => 'member',
                'joined_on' => now(),
            ]);
            
            DB::commit();
            
            return $this->sendResponse(
                $committee->load(['chairperson', 'members']), 
                'Committee created successfully', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error creating committee', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified committee.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $committee = Committee::with(['chairperson', 'members', 'projects', 'documents'])->find($id);

        if (is_null($committee)) {
            return $this->sendError('Committee not found');
        }

        return $this->sendResponse($committee, 'Committee retrieved successfully');
    }

    /**
     * Update the specified committee in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $committee = Committee::find($id);

        if (is_null($committee)) {
            return $this->sendError('Committee not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'chairperson_id' => 'sometimes|required|exists:users,id',
            'meeting_schedule' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        DB::beginTransaction();
        
        try {
            $committee->update($request->all());
            
            // If chairperson changed, update their role in the pivot table
            if ($request->has('chairperson_id') && $committee->wasChanged('chairperson_id')) {
                // Remove old chairperson's role
                $committee->members()->updateExistingPivot($committee->getOriginal('chairperson_id'), [
                    'role' => 'member'
                ]);
                
                // Set new chairperson's role
                $committee->members()->syncWithoutDetaching([
                    $request->chairperson_id => [
                        'role' => 'chairperson',
                        'joined_on' => now(),
                    ]
                ]);
            }
            
            DB::commit();
            
            return $this->sendResponse(
                $committee->load(['chairperson', 'members']), 
                'Committee updated successfully'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error updating committee', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified committee from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $committee = Committee::find($id);

        if (is_null($committee)) {
            return $this->sendError('Committee not found');
        }
        
        // Check if there are any associated projects
        if ($committee->projects()->count() > 0) {
            return $this->sendError(
                'Cannot delete committee with associated projects', 
                ['error' => 'Please reassign or delete the projects first'],
                422
            );
        }
        
        // Delete associated documents (if any)
        $committee->documents()->delete();
        
        // Detach all members
        $committee->members()->detach();
        
        // Delete the committee
        $committee->delete();

        return $this->sendResponse([], 'Committee deleted successfully');
    }

    /**
     * Add members to the committee.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addMembers(Request $request, $id)
    {
        $committee = Committee::find($id);

        if (is_null($committee)) {
            return $this->sendError('Committee not found');
        }

        $validator = Validator::make($request->all(), [
            'members' => 'required|array',
            'members.*.user_id' => 'required|exists:users,id',
            'members.*.role' => 'required|in:member,secretary,treasurer,vice_chair',
            'members.*.joined_on' => 'nullable|date',
            'members.*.notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $membersData = [];
        foreach ($request->members as $member) {
            $membersData[$member['user_id']] = [
                'role' => $member['role'],
                'joined_on' => $member['joined_on'] ?? now(),
                'notes' => $member['notes'] ?? null,
            ];
        }

        $committee->members()->syncWithoutDetaching($membersData);

        return $this->sendResponse(
            $committee->load('members'), 
            'Members added to committee successfully'
        );
    }

    /**
     * Remove members from the committee.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeMembers(Request $request, $id)
    {
        $committee = Committee::find($id);

        if (is_null($committee)) {
            return $this->sendError('Committee not found');
        }

        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        // Prevent removing the chairperson
        $chairpersonId = $committee->chairperson_id;
        if (in_array($chairpersonId, $request->user_ids)) {
            return $this->sendError(
                'Cannot remove chairperson', 
                ['error' => 'Please assign a new chairperson before removing the current one'],
                422
            );
        }

        $committee->members()->detach($request->user_ids);

        return $this->sendResponse(
            $committee->load('members'), 
            'Members removed from committee successfully'
        );
    }

    /**
     * Update member role in the committee.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMemberRole(Request $request, $id, $userId)
    {
        $committee = Committee::find($id);

        if (is_null($committee)) {
            return $this->sendError('Committee not found');
        }
        
        // Check if user is a member of the committee
        if (!$committee->members()->where('user_id', $userId)->exists()) {
            return $this->sendError('User is not a member of this committee', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'role' => 'required|in:member,secretary,treasurer,vice_chair',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        // If setting as new chairperson
        if ($request->role === 'chairperson') {
            // Update the committee's chairperson_id
            $committee->update(['chairperson_id' => $userId]);
            
            // Update the old chairperson's role to member
            $committee->members()->updateExistingPivot($committee->getOriginal('chairperson_id'), [
                'role' => 'member'
            ]);
        }
        
        // Update the member's role
        $committee->members()->updateExistingPivot($userId, [
            'role' => $request->role
        ]);

        return $this->sendResponse(
            $committee->load('members'), 
            'Member role updated successfully'
        );
    }

    /**
     * Get committee statistics.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics($id)
    {
        $committee = Committee::withCount(['members', 'projects', 'documents'])->find($id);

        if (is_null($committee)) {
            return $this->sendError('Committee not found');
        }
        
        $activeProjects = $committee->projects()->where('status', 'in_progress')->count();
        $completedProjects = $committee->projects()->where('status', 'completed')->count();
        $totalBudget = $committee->projects()->sum('budget');
        $totalSpent = $committee->projects()->sum('amount_spent');
        
        $stats = [
            'total_members' => $committee->members_count,
            'total_projects' => $committee->projects_count,
            'active_projects' => $activeProjects,
            'completed_projects' => $completedProjects,
            'total_documents' => $committee->documents_count,
            'total_budget' => (float) $totalBudget,
            'total_spent' => (float) $totalSpent,
            'budget_utilization' => $totalBudget > 0 ? ($totalSpent / $totalBudget) * 100 : 0,
        ];

        return $this->sendResponse($stats, 'Committee statistics retrieved successfully');
    }
}
