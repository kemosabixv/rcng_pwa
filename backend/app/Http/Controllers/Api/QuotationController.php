<?php

namespace App\Http\Controllers\Api;

use App\Models\Quotation;
use App\Models\QuotationItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class QuotationController extends BaseController
{
    /**
     * Display a listing of the quotations.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $params = $this->getPaginationParams($request);
        
        $query = Quotation::with(['project', 'creator', 'items']);
        
        // Filter by project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by creator
        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }
        
        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('quotation_date', [$request->start_date, $request->end_date]);
        }
        
        // Filter by amount range
        if ($request->has('min_amount') && $request->has('max_amount')) {
            $query->whereBetween('total_amount', [$request->min_amount, $request->max_amount]);
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                  ->orWhere('vendor_name', 'like', "%{$search}%")
                  ->orWhere('vendor_email', 'like', "%{$search}%")
                  ->orWhere('vendor_company', 'like', "%{$search}%");
            });
        }
        
        // Order results
        $query->orderBy($params['sort_by'], $params['sort_order']);
        
        $quotations = $query->paginate($params['per_page']);
        
        return $this->sendResponse($quotations, 'Quotations retrieved successfully');
    }

    /**
     * Store a newly created quotation in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'nullable|exists:projects,id',
            'vendor_name' => 'required|string|max:255',
            'vendor_email' => 'nullable|email|max:255',
            'vendor_phone' => 'nullable|string|max:20',
            'vendor_company' => 'nullable|string|max:255',
            'vendor_address' => 'nullable|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'status' => 'required|in:draft,sent,accepted,rejected,expired',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
            'created_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        DB::beginTransaction();
        
        try {
            // Generate quotation number
            $quotationNumber = Quotation::generateQuotationNumber();
            
            // Prepare quotation data
            $quotationData = $request->all();
            $quotationData['quotation_number'] = $quotationNumber;
            
            // Create quotation
            $quotation = Quotation::create($quotationData);
            
            DB::commit();
            
            return $this->sendResponse(
                $quotation->load(['project', 'creator']), 
                'Quotation created successfully', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error creating quotation', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified quotation.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $quotation = Quotation::with(['project', 'creator', 'items'])->find($id);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }

        return $this->sendResponse($quotation, 'Quotation retrieved successfully');
    }

    /**
     * Update the specified quotation in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $quotation = Quotation::find($id);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        // Prevent updates to accepted or rejected quotations
        if (in_array($quotation->status, ['accepted', 'rejected'])) {
            return $this->sendError(
                'Cannot update a ' . $quotation->status . ' quotation',
                [],
                422
            );
        }

        $validator = Validator::make($request->all(), [
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:issue_date',
            'vendor_name' => 'required|string|max:255',
            'vendor_email' => 'nullable|email|max:255',
            'vendor_phone' => 'nullable|string|max:20',
            'vendor_company' => 'nullable|string|max:255',
            'vendor_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,sent,accepted,rejected,expired',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        // If status is being updated to accepted or rejected, set the corresponding date
        if ($request->has('status') && in_array($request->status, ['accepted', 'rejected'])) {
            $statusField = $request->status . '_at';
            $request->merge([$statusField => now()]);
        }

        $quotation->update($request->all());
        $quotation->load(['project', 'creator', 'items']);

        return $this->sendResponse($quotation, 'Quotation updated successfully');
    }

    /**
     * Remove the specified quotation from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $quotation = Quotation::find($id);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        // Prevent deletion of accepted or rejected quotations
        if (in_array($quotation->status, ['accepted', 'rejected'])) {
            return $this->sendError(
                'Cannot delete a ' . $quotation->status . ' quotation',
                [],
                422
            );
        }
        
        // Delete associated items
        $quotation->items()->delete();
        
        // Delete the quotation
        $quotation->delete();

        return $this->sendResponse([], 'Quotation deleted successfully');
    }
    
    /**
     * Add items to the quotation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItems(Request $request, $id)
    {
        $quotation = Quotation::find($id);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        // Prevent updates to accepted or rejected quotations
        if (in_array($quotation->status, ['accepted', 'rejected'])) {
            return $this->sendError(
                'Cannot update a ' . $quotation->status . ' quotation',
                [],
                422
            );
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'sometimes|numeric|min:0|max:100',
            'items.*.tax_amount' => 'sometimes|numeric|min:0',
            'items.*.total_amount' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        DB::beginTransaction();
        
        try {
            $subtotal = $quotation->subtotal;
            $totalTax = $quotation->tax_amount;
            
            foreach ($request->items as $item) {
                $taxRate = $item['tax_rate'] ?? 0;
                $taxAmount = $item['tax_amount'] ?? ($item['quantity'] * $item['unit_price'] * $taxRate / 100);
                $totalAmount = $item['total_amount'] ?? ($item['quantity'] * $item['unit_price'] + $taxAmount);
                
                $quotationItem = new QuotationItem([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                ]);
                
                $quotation->items()->save($quotationItem);
                
                $subtotal += $item['quantity'] * $item['unit_price'];
                $totalTax += $taxAmount;
            }
            
            // Update quotation totals
            $quotation->update([
                'subtotal' => $subtotal,
                'tax_amount' => $totalTax,
                'total_amount' => $subtotal + $totalTax,
            ]);
            
            DB::commit();
            
            return $this->sendResponse(
                $quotation->load('items'), 
                'Items added to quotation successfully'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error adding items to quotation', ['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update a quotation item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $quotationId
     * @param  int  $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateItem(Request $request, $quotationId, $itemId)
    {
        $quotation = Quotation::find($quotationId);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        // Prevent updates to accepted or rejected quotations
        if (in_array($quotation->status, ['accepted', 'rejected'])) {
            return $this->sendError(
                'Cannot update items in a ' . $quotation->status . ' quotation',
                [],
                422
            );
        }
        
        $item = $quotation->items()->find($itemId);
        
        if (is_null($item)) {
            return $this->sendError('Item not found in this quotation');
        }

        $validator = Validator::make($request->all(), [
            'description' => 'sometimes|required|string|max:500',
            'quantity' => 'sometimes|required|numeric|min:0.01',
            'unit_price' => 'sometimes|required|numeric|min:0',
            'tax_rate' => 'sometimes|numeric|min:0|max:100',
            'tax_amount' => 'sometimes|numeric|min:0',
            'total_amount' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        DB::beginTransaction();
        
        try {
            $updateData = $request->all();
            
            // If quantity or unit_price is being updated, recalculate tax and total
            if ($request->has('quantity') || $request->has('unit_price') || $request->has('tax_rate')) {
                $quantity = $request->has('quantity') ? $request->quantity : $item->quantity;
                $unitPrice = $request->has('unit_price') ? $request->unit_price : $item->unit_price;
                $taxRate = $request->has('tax_rate') ? $request->tax_rate : $item->tax_rate;
                
                $taxAmount = $quantity * $unitPrice * $taxRate / 100;
                $totalAmount = ($quantity * $unitPrice) + $taxAmount;
                
                $updateData['tax_amount'] = $taxAmount;
                $updateData['total_amount'] = $totalAmount;
            }
            
            $item->update($updateData);
            
            // Recalculate quotation totals
            $this->recalculateQuotationTotals($quotation);
            
            DB::commit();
            
            return $this->sendResponse(
                $quotation->load('items'), 
                'Quotation item updated successfully'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error updating quotation item', ['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Remove an item from the quotation.
     *
     * @param  int  $quotationId
     * @param  int  $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeItem($quotationId, $itemId)
    {
        $quotation = Quotation::find($quotationId);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        // Prevent updates to accepted or rejected quotations
        if (in_array($quotation->status, ['accepted', 'rejected'])) {
            return $this->sendError(
                'Cannot update items in a ' . $quotation->status . ' quotation',
                [],
                422
            );
        }
        
        $item = $quotation->items()->find($itemId);
        
        if (is_null($item)) {
            return $this->sendError('Item not found in this quotation');
        }
        
        DB::beginTransaction();
        
        try {
            // Delete the item
            $item->delete();
            
            // Recalculate quotation totals if there are still items left
            if ($quotation->items()->count() > 0) {
                $this->recalculateQuotationTotals($quotation);
            } else {
                // If no items left, reset totals
                $quotation->update([
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'total_amount' => 0,
                ]);
            }
            
            DB::commit();
            
            return $this->sendResponse(
                $quotation->load('items'), 
                'Item removed from quotation successfully'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error removing item from quotation', ['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Mark a quotation as sent.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsSent($id)
    {
        $quotation = Quotation::find($id);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        if ($quotation->status === 'sent') {
            return $this->sendError('Quotation is already marked as sent');
        }
        
        if ($quotation->status !== 'draft') {
            return $this->sendError('Only draft quotations can be marked as sent');
        }
        
        $quotation->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
        
        // TODO: Send email notification
        
        return $this->sendResponse(
            $quotation->load(['project', 'creator', 'items']), 
            'Quotation marked as sent successfully'
        );
    }
    
    /**
     * Accept a quotation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function accept(Request $request, $id)
    {
        $quotation = Quotation::find($id);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        if ($quotation->status === 'accepted') {
            return $this->sendError('Quotation is already accepted');
        }
        
        if ($quotation->status === 'rejected') {
            return $this->sendError('Cannot accept a rejected quotation');
        }
        
        if ($quotation->status === 'expired') {
            return $this->sendError('Cannot accept an expired quotation');
        }
        
        $validator = Validator::make($request->all(), [
            'accepted_by' => 'required|exists:users,id',
            'accepted_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $quotation->update([
            'status' => 'accepted',
            'accepted_by' => $request->accepted_by,
            'accepted_at' => now(),
            'accepted_notes' => $request->accepted_notes,
        ]);
        
        // TODO: Send email notification
        
        return $this->sendResponse(
            $quotation->load(['project', 'creator', 'items']), 
            'Quotation accepted successfully'
        );
    }
    
    /**
     * Reject a quotation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(Request $request, $id)
    {
        $quotation = Quotation::find($id);

        if (is_null($quotation)) {
            return $this->sendError('Quotation not found');
        }
        
        if ($quotation->status === 'rejected') {
            return $this->sendError('Quotation is already rejected');
        }
        
        if ($quotation->status === 'accepted') {
            return $this->sendError('Cannot reject an accepted quotation');
        }
        
        if ($quotation->status === 'expired') {
            return $this->sendError('Cannot reject an expired quotation');
        }
        
        $validator = Validator::make($request->all(), [
            'rejected_by' => 'required|exists:users,id',
            'rejection_reason' => 'required|string',
            'rejection_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $quotation->update([
            'status' => 'rejected',
            'rejected_by' => $request->rejected_by,
            'rejected_at' => now(),
            'rejection_reason' => $request->rejection_reason,
            'rejection_notes' => $request->rejection_notes,
        ]);
        
        // TODO: Send email notification
        
        return $this->sendResponse(
            $quotation->load(['project', 'creator', 'items']), 
            'Quotation rejected successfully'
        );
    }
    
    /**
     * Duplicate a quotation.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function duplicate($id)
    {
        $originalQuotation = Quotation::with('items')->find($id);

        if (is_null($originalQuotation)) {
            return $this->sendError('Quotation not found');
        }
        
        DB::beginTransaction();
        
        try {
            // Create a new quotation with the same data
            $newQuotation = $originalQuotation->replicate();
            $newQuotation->quotation_number = Quotation::generateQuotationNumber();
            $newQuotation->status = 'draft';
            $newQuotation->sent_at = null;
            $newQuotation->accepted_at = null;
            $newQuotation->accepted_by = null;
            $newQuotation->accepted_notes = null;
            $newQuotation->rejected_at = null;
            $newQuotation->rejected_by = null;
            $newQuotation->rejection_reason = null;
            $newQuotation->rejection_notes = null;
            $newQuotation->created_at = now();
            $newQuotation->updated_at = now();
            $newQuotation->save();
            
            // Duplicate items
            foreach ($originalQuotation->items as $item) {
                $newItem = $item->replicate();
                $newItem->quotation_id = $newQuotation->id;
                $newItem->save();
            }
            
            DB::commit();
            
            return $this->sendResponse(
                $newQuotation->load(['project', 'creator', 'items']), 
                'Quotation duplicated successfully',
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Error duplicating quotation', ['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get quotation statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $totalQuotations = Quotation::count();
        $totalAmount = Quotation::sum('total_amount');
        
        $quotationsByStatus = Quotation::selectRaw('status, COUNT(*) as count, SUM(total_amount) as total_amount')
            ->groupBy('status')
            ->get();
            
        $quotationsByMonth = Quotation::selectRaw('DATE_FORMAT(issue_date, "%Y-%m") as month, COUNT(*) as count, SUM(total_amount) as total_amount')
            ->whereNotNull('issue_date')
            ->where('issue_date', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                // Ensure month is always in YYYY-MM format
                $item->month = $item->month ?? now()->format('Y-m');
                return $item;
            });
        
        $topVendors = Quotation::selectRaw('vendor_name, COUNT(*) as count, SUM(total_amount) as total_amount')
            ->groupBy('vendor_name')
            ->orderBy('total_amount', 'desc')
            ->limit(5)
            ->get();
        
        $recentQuotations = Quotation::with('project')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        $stats = [
            'total_quotations' => $totalQuotations,
            'total_amount' => (float) $totalAmount,
            'quotations_by_status' => $quotationsByStatus,
            'quotations_by_month' => $quotationsByMonth,
            'top_vendors' => $topVendors,
            'recent_quotations' => $recentQuotations,
        ];

        return $this->sendResponse($stats, 'Quotation statistics retrieved successfully');
    }
    
    /**
     * Recalculate quotation totals based on its items.
     *
     * @param  \App\Models\Quotation  $quotation
     * @return void
     */
    private function recalculateQuotationTotals($quotation)
    {
        $subtotal = 0;
        $totalTax = 0;
        
        foreach ($quotation->items as $item) {
            $subtotal += $item->quantity * $item->unit_price;
            $totalTax += $item->tax_amount;
        }
        
        $quotation->update([
            'subtotal' => $subtotal,
            'tax_amount' => $totalTax,
            'total_amount' => $subtotal + $totalTax,
        ]);
    }
}
