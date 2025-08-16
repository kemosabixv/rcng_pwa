<?php

namespace App\Http\Controllers\Api;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProjectController extends BaseController
{
    /**
     * Display a listing of the projects.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $params = $this->getPaginationParams($request);
        
        $query = Project::with(['committee', 'creator', 'members']);
        
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
        
        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        
        // Filter by committee
        if ($request->has('committee_id')) {
            $query->where('committee_id', $request->committee_id);
        }
        
        // Filter by creator
        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }
        
        // Filter by member
        if ($request->has('member_id')) {
            $query->whereHas('members', function($q) use ($request) {
                $q->where('user_id', $request->member_id);
            });
        }
        
        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                  ->orWhereBetween('end_date', [$request->start_date, $request->end_date]);
        }
        
        // Order results
        $query->orderBy($params['sort_by'], $params['sort_order']);
        
        $projects = $query->paginate($params['per_page']);
        
        return $this->sendResponse($projects, 'Projects retrieved successfully');
    }

    /**
     * Store a newly created project in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'committee_id' => 'nullable|exists:committees,id',
            'budget' => 'required|numeric|min:0',
            'amount_spent' => 'sometimes|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:planning,in_progress,on_hold,completed,cancelled',
            'progress' => 'sometimes|integer|min:0|max:100',
            'priority' => 'required|in:low,medium,high',
            'created_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        DB::beginTransaction();
        
        try {
            $project = Project::create($request->all());
            
            // Add creator as a member with 'manager' role
            if ($request->has('created_by')) {
                $project->members()->attach($request->created_by, [
                    'role' => 'manager',
                    'assigned_on' => now(),
                ]);
            }
            
            DB::commit();
            
            return $this->sendResponse(
                $project->load(['committee', 'creator', 'members']), 
                'Project created successfully', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error creating project', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified project.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $project = Project::with([
            'committee', 
            'creator', 
            'members', 
            'documents', 
            'quotations'
        ])->find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }

        return $this->sendResponse($project, 'Project retrieved successfully');
    }

    /**
     * Update the specified project in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'committee_id' => 'nullable|exists:committees,id',
            'budget' => 'sometimes|required|numeric|min:0',
            'amount_spent' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'status' => 'sometimes|required|in:planning,in_progress,on_hold,completed,cancelled',
            'progress' => 'sometimes|integer|min:0|max:100',
            'priority' => 'sometimes|required|in:low,medium,high',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $project->update($request->all());

        return $this->sendResponse(
            $project->load(['committee', 'creator', 'members']), 
            'Project updated successfully'
        );
    }

    /**
     * Update the project's progress.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProgress(Request $request, $id)
    {
        $project = Project::find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }

        $validator = Validator::make($request->all(), [
            'progress' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $project->updateProgress($request->progress);
        
        // You might want to log this progress update in an activity log
        // Activity::create([...]);

        return $this->sendResponse(
            $project->load(['committee', 'creator', 'members']), 
            'Project progress updated successfully'
        );
    }

    /**
     * Remove the specified project from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $project = Project::find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }
        
        // Check if there are any associated documents or quotations
        if ($project->documents()->count() > 0 || $project->quotations()->count() > 0) {
            return $this->sendError(
                'Cannot delete project with associated documents or quotations', 
                ['error' => 'Please delete the associated documents and quotations first'],
                422
            );
        }
        
        // Detach all members
        $project->members()->detach();
        
        // Delete the project
        $project->delete();

        return $this->sendResponse([], 'Project deleted successfully');
    }

    /**
     * Add members to the project.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addMembers(Request $request, $id)
    {
        $project = Project::find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }

        $validator = Validator::make($request->all(), [
            'members' => 'required|array',
            'members.*.user_id' => 'required|exists:users,id',
            'members.*.role' => 'required|in:manager,member,contributor',
            'members.*.responsibilities' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $membersData = [];
        foreach ($request->members as $member) {
            $membersData[$member['user_id']] = [
                'role' => $member['role'],
                'responsibilities' => $member['responsibilities'] ?? null,
                'assigned_on' => now(),
            ];
        }

        $project->members()->syncWithoutDetaching($membersData);

        return $this->sendResponse(
            $project->load('members'), 
            'Members added to project successfully'
        );
    }

    /**
     * Remove members from the project.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeMembers(Request $request, $id)
    {
        $project = Project::find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }

        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $project->members()->detach($request->user_ids);

        return $this->sendResponse(
            $project->load('members'), 
            'Members removed from project successfully'
        );
    }

    /**
     * Mark a project as completed.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function complete($id)
    {
        $project = Project::find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }

        if ($project->status === 'completed') {
            return $this->sendError('Project is already marked as completed');
        }

        $project->update([
            'status' => 'completed',
            'progress' => 100,
            'end_date' => now(),
        ]);
        
        // Update completion date for all members
        $project->members()->updateExistingPivot(
            $project->members->pluck('id')->toArray(),
            ['completed_on' => now()]
        );

        return $this->sendResponse(
            $project->load('members'), 
            'Project marked as completed successfully'
        );
    }

    /**
     * Get project statistics.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics($id)
    {
        $project = Project::withCount(['members', 'documents', 'quotations'])->find($id);

        if (is_null($project)) {
            return $this->sendError('Project not found');
        }
        
        $totalTasks = 0; // Assuming you have tasks related to projects
        $completedTasks = 0; // Assuming you have tasks related to projects
        $budgetUtilization = $project->budget > 0 ? ($project->amount_spent / $project->budget) * 100 : 0;
        $daysRemaining = now()->diffInDays($project->end_date, false);
        $daysElapsed = now()->diffInDays($project->start_date);
        $totalDuration = $project->start_date->diffInDays($project->end_date);
        $timeElapsed = $totalDuration > 0 ? ($daysElapsed / $totalDuration) * 100 : 0;
        
        $stats = [
            'total_members' => $project->members_count,
            'total_documents' => $project->documents_count,
            'total_quotations' => $project->quotations_count,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'completion_rate' => $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0,
            'budget' => (float) $project->budget,
            'amount_spent' => (float) $project->amount_spent,
            'budget_utilization' => $budgetUtilization,
            'start_date' => $project->start_date->toDateString(),
            'end_date' => $project->end_date->toDateString(),
            'days_remaining' => $daysRemaining,
            'days_elapsed' => $daysElapsed,
            'time_elapsed_percentage' => $timeElapsed,
            'is_on_track' => $project->progress >= $timeElapsed,
        ];

        return $this->sendResponse($stats, 'Project statistics retrieved successfully');
    }
}
