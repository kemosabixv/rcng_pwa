<?php

namespace App\Http\Controllers\Api;

use App\Models\Due;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DueController extends BaseController
{
    /**
     * Display a listing of the dues.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $params = $this->getPaginationParams($request);
        
        $query = Due::with(['user', 'recorder']);
        
        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('due_date', [$request->start_date, $request->end_date]);
        }
        
        // Filter by amount range
        if ($request->has('min_amount') && $request->has('max_amount')) {
            $query->whereBetween('amount', [$request->min_amount, $request->max_amount]);
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Order results
        $query->orderBy($params['sort_by'], $params['sort_order']);
        
        $dues = $query->paginate($params['per_page']);
        
        return $this->sendResponse($dues, 'Dues retrieved successfully');
    }

    /**
     * Store a newly created due in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|string|max:100',
            'status' => 'sometimes|in:pending,paid,overdue,waived',
            'due_date' => 'required|date',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'recorded_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $due = Due::create($request->all());

        return $this->sendResponse(
            $due->load(['user', 'recorder']), 
            'Due created successfully', 
            201
        );
    }

    /**
     * Display the specified due.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $due = Due::with(['user', 'recorder'])->find($id);

        if (is_null($due)) {
            return $this->sendError('Due not found');
        }

        return $this->sendResponse($due, 'Due retrieved successfully');
    }

    /**
     * Update the specified due in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $due = Due::find($id);

        if (is_null($due)) {
            return $this->sendError('Due not found');
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|required|numeric|min:0',
            'type' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:pending,paid,overdue,waived',
            'due_date' => 'sometimes|required|date',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $due->update($request->all());

        return $this->sendResponse(
            $due->load(['user', 'recorder']), 
            'Due updated successfully'
        );
    }

    /**
     * Mark a due as paid.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsPaid(Request $request, $id)
    {
        $due = Due::find($id);

        if (is_null($due)) {
            return $this->sendError('Due not found');
        }

        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string|max:100',
            'transaction_id' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $due->markAsPaid(
            $request->payment_method,
            $request->transaction_id,
            $request->notes
        );

        return $this->sendResponse(
            $due->load(['user', 'recorder']), 
            'Due marked as paid successfully'
        );
    }

    /**
     * Get user's due summary.
     *
     * @param  int  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function userSummary($userId)
    {
        $user = User::find($userId);

        if (is_null($user)) {
            return $this->sendError('User not found');
        }

        $year = request('year', date('Y'));
        $summary = Due::getYearlySummary($userId, $year);

        return $this->sendResponse($summary, 'User due summary retrieved successfully');
    }

    /**
     * Get due statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $totalDues = Due::sum('amount');
        $totalPaid = Due::where('status', 'paid')->sum('amount');
        $totalPending = Due::where('status', 'pending')->sum('amount');
        $totalOverdue = Due::where('status', 'overdue')->sum('amount');
        $totalWaived = Due::where('status', 'waived')->sum('amount');
        
        $currentYear = date('Y');
        $monthlyData = [];
        
        for ($i = 1; $i <= 12; $i++) {
            $month = str_pad($i, 2, '0', STR_PAD_LEFT);
            $startDate = "{$currentYear}-{$month}-01";
            $endDate = date('Y-m-t', strtotime($startDate));
            
            $monthlyData[] = [
                'month' => date('M Y', strtotime($startDate)),
                'total' => (float) Due::whereBetween('due_date', [$startDate, $endDate])->sum('amount'),
                'paid' => (float) Due::where('status', 'paid')
                    ->whereBetween('due_date', [$startDate, $endDate])
                    ->sum('amount'),
                'pending' => (float) Due::where('status', 'pending')
                    ->whereBetween('due_date', [$startDate, $endDate])
                    ->sum('amount'),
                'overdue' => (float) Due::where('status', 'overdue')
                    ->whereBetween('due_date', [$startDate, $endDate])
                    ->sum('amount'),
            ];
        }
        
        $typeBreakdown = Due::selectRaw('type, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('type')
            ->get();
        
        $stats = [
            'total_dues' => (float) $totalDues,
            'total_paid' => (float) $totalPaid,
            'total_pending' => (float) $totalPending,
            'total_overdue' => (float) $totalOverdue,
            'total_waived' => (float) $totalWaived,
            'collection_rate' => $totalDues > 0 ? ($totalPaid / $totalDues) * 100 : 0,
            'monthly_data' => $monthlyData,
            'type_breakdown' => $typeBreakdown,
        ];

        return $this->sendResponse($stats, 'Due statistics retrieved successfully');
    }

    /**
     * Get overdue dues.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function overdue()
    {
        $overdueDues = Due::with(['user'])
            ->where('status', 'pending')
            ->whereDate('due_date', '<', now())
            ->orderBy('due_date')
            ->get();

        return $this->sendResponse($overdueDues, 'Overdue dues retrieved successfully');
    }

    /**
     * Send payment reminder for a due.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendReminder($id)
    {
        $due = Due::with(['user'])->find($id);

        if (is_null($due)) {
            return $this->sendError('Due not found');
        }

        if ($due->status === 'paid') {
            return $this->sendError('Cannot send reminder for a paid due', [], 422);
        }

        // TODO: Implement actual email notification
        // Mail::to($due->user->email)->send(new DueReminder($due));

        // Log the reminder
        // Activity::create([...]);

        return $this->sendResponse(
            $due, 
            'Payment reminder sent successfully'
        );
    }

    /**
     * Waive a due.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function waive(Request $request, $id)
    {
        $due = Due::find($id);

        if (is_null($due)) {
            return $this->sendError('Due not found');
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string',
            'waived_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $due->update([
            'status' => 'waived',
            'notes' => $due->notes . "\n\nWaived on: " . now() . ". Reason: " . $request->reason,
        ]);

        // Log the waiver
        // Activity::create([...]);

        return $this->sendResponse(
            $due->load(['user', 'recorder']), 
            'Due waived successfully'
        );
    }
}
