<?php

namespace App\Http\Controllers\Api;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DocumentController extends BaseController
{
    /**
     * Display a listing of the documents.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $params = $this->getPaginationParams($request);
        
        $query = Document::with(['uploader', 'committee', 'project']);
        
        // Filter by uploader
        if ($request->has('uploader_id')) {
            $query->where('uploaded_by', $request->uploader_id);
        }
        
        // Filter by committee
        if ($request->has('committee_id')) {
            $query->where('committee_id', $request->committee_id);
        }
        
        // Filter by project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        // Filter by document type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by visibility
        if ($request->has('visibility')) {
            $query->where('visibility', $request->visibility);
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }
        
        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }
        
        // Order results
        $query->orderBy($params['sort_by'], $params['sort_order']);
        
        $documents = $query->paginate($params['per_page']);
        
        return $this->sendResponse($documents, 'Documents retrieved successfully');
    }

    /**
     * Store a newly created document in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240', // Max 10MB
            'type' => 'required|string|max:100',
            'visibility' => 'required|in:public,private,restricted',
            'uploaded_by' => 'required|exists:users,id',
            'committee_id' => 'nullable|exists:committees,id',
            'project_id' => 'nullable|exists:projects,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        // Handle file upload
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::uuid() . '.' . $extension;
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();
        
        // Store the file in the 'documents' directory in the storage/app/public directory
        $path = $file->storeAs('documents', $fileName, 'public');
        
        // Create document record
        $document = Document::create([
            'title' => $request->title,
            'description' => $request->description,
            'file_name' => $originalName,
            'file_path' => $path,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'type' => $request->type,
            'visibility' => $request->visibility,
            'uploaded_by' => $request->uploaded_by,
            'committee_id' => $request->committee_id,
            'project_id' => $request->project_id,
            'tags' => $request->tags ? json_encode($request->tags) : null,
        ]);
        
        // Attach document to committee/project if specified
        if ($request->has('committee_id')) {
            $document->committee()->associate($request->committee_id);
        }
        
        if ($request->has('project_id')) {
            $document->project()->associate($request->project_id);
        }
        
        $document->load(['uploader', 'committee', 'project']);

        return $this->sendResponse(
            $document, 
            'Document uploaded successfully', 
            201
        );
    }

    /**
     * Display the specified document.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function show($id)
    {
        $document = Document::with(['uploader', 'committee', 'project'])->find($id);

        if (is_null($document)) {
            return $this->sendError('Document not found');
        }
        
        // Check if the current user has permission to view this document
        if (!$this->canViewDocument($document, auth()->id())) {
            return $this->sendError('You do not have permission to view this document', [], 403);
        }

        return $this->sendResponse($document, 'Document retrieved successfully');
    }
    
    /**
     * Download the specified document.
     *
     * @param  int  $id
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
     */
    public function download($id)
    {
        $document = Document::find($id);

        if (is_null($document)) {
            return $this->sendError('Document not found');
        }
        
        // Check if the current user has permission to download this document
        if (!$this->canViewDocument($document, auth()->id())) {
            return $this->sendError('You do not have permission to download this document', [], 403);
        }
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return $this->sendError('File not found on server', [], 404);
        }
        
        // Increment download count
        $document->increment('download_count');
        
        return response()->download($filePath, $document->file_name);
    }
    
    /**
     * Preview the specified document.
     *
     * @param  int  $id
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
     */
    public function preview($id)
    {
        $document = Document::find($id);

        if (is_null($document)) {
            return $this->sendError('Document not found');
        }
        
        // Check if the current user has permission to view this document
        if (!$this->canViewDocument($document, auth()->id())) {
            return $this->sendError('You do not have permission to preview this document', [], 403);
        }
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return $this->sendError('File not found on server', [], 404);
        }
        
        // Increment view count
        $document->increment('view_count');
        
        $headers = [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
        ];
        
        return response()->file($filePath, $headers);
    }

    /**
     * Update the specified document in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $document = Document::find($id);

        if (is_null($document)) {
            return $this->sendError('Document not found');
        }
        
        // Check if the current user has permission to update this document
        if (!$this->canEditDocument($document, auth()->id())) {
            return $this->sendError('You do not have permission to update this document', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|string|max:100',
            'visibility' => 'sometimes|required|in:public,private,restricted',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $updateData = $request->only(['title', 'description', 'type', 'visibility']);
        
        if ($request->has('tags')) {
            $updateData['tags'] = json_encode($request->tags);
        }
        
        $document->update($updateData);
        $document->load(['uploader', 'committee', 'project']);

        return $this->sendResponse(
            $document, 
            'Document updated successfully'
        );
    }
    
    /**
     * Replace the document file.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function replaceFile(Request $request, $id)
    {
        $document = Document::find($id);

        if (is_null($document)) {
            return $this->sendError('Document not found');
        }
        
        // Check if the current user has permission to update this document
        if (!$this->canEditDocument($document, auth()->id())) {
            return $this->sendError('You do not have permission to update this document', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // Max 10MB
            'update_file_name' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        // Delete the old file
        Storage::disk('public')->delete($document->file_path);
        
        // Handle new file upload
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::uuid() . '.' . $extension;
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();
        
        // Store the file in the 'documents' directory in the storage/app/public directory
        $path = $file->storeAs('documents', $fileName, 'public');
        
        // Update document record
        $updateData = [
            'file_path' => $path,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'version' => $document->version + 1,
            'updated_by' => auth()->id(),
        ];
        
        if ($request->get('update_file_name', false)) {
            $updateData['file_name'] = $originalName;
        }
        
        $document->update($updateData);
        
        // Log the file replacement
        // Activity::create([...]);
        
        $document->load(['uploader', 'committee', 'project']);

        return $this->sendResponse(
            $document, 
            'Document file replaced successfully'
        );
    }

    /**
     * Remove the specified document from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $document = Document::find($id);

        if (is_null($document)) {
            return $this->sendError('Document not found');
        }
        
        // Check if the current user has permission to delete this document
        if (!$this->canDeleteDocument($document, auth()->id())) {
            return $this->sendError('You do not have permission to delete this document', [], 403);
        }
        
        // Delete the file from storage
        Storage::disk('public')->delete($document->file_path);
        
        // Delete the document record
        $document->delete();

        return $this->sendResponse([], 'Document deleted successfully');
    }
    
    /**
     * Get document statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $totalDocuments = Document::count();
        $totalSize = Document::sum('file_size');
        
        $documentsByType = Document::selectRaw('type, COUNT(*) as count, SUM(file_size) as size')
            ->groupBy('type')
            ->get();
            
        $documentsByVisibility = Document::selectRaw('visibility, COUNT(*) as count')
            ->groupBy('visibility')
            ->get();
            
        $recentUploads = Document::with('uploader')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        $largestDocuments = Document::with('uploader')
            ->orderBy('file_size', 'desc')
            ->limit(5)
            ->get();
        
        $stats = [
            'total_documents' => $totalDocuments,
            'total_size' => (int) $totalSize,
            'formatted_total_size' => $this->formatBytes($totalSize),
            'documents_by_type' => $documentsByType,
            'documents_by_visibility' => $documentsByVisibility,
            'recent_uploads' => $recentUploads,
            'largest_documents' => $largestDocuments,
        ];

        return $this->sendResponse($stats, 'Document statistics retrieved successfully');
    }
    
    /**
     * Check if a user can view a document.
     *
     * @param  \App\Models\Document  $document
     * @param  int  $userId
     * @return bool
     */
    private function canViewDocument($document, $userId)
    {
        // Public documents can be viewed by anyone
        if ($document->visibility === 'public') {
            return true;
        }
        
        // Private documents can only be viewed by the uploader
        if ($document->visibility === 'private') {
            return $document->uploaded_by === $userId;
        }
        
        // Restricted documents can be viewed by uploader, committee members, or project members
        if ($document->visibility === 'restricted') {
            // Uploader can always view
            if ($document->uploaded_by === $userId) {
                return true;
            }
            
            // Committee members can view committee documents
            if ($document->committee_id) {
                $isCommitteeMember = $document->committee->members()
                    ->where('user_id', $userId)
                    ->exists();
                    
                if ($isCommitteeMember) {
                    return true;
                }
            }
            
            // Project members can view project documents
            if ($document->project_id) {
                $isProjectMember = $document->project->members()
                    ->where('user_id', $userId)
                    ->exists();
                    
                if ($isProjectMember) {
                    return true;
                }
            }
            
            // Admins can view any document
            $user = User::find($userId);
            if ($user && $user->isAdmin()) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if a user can edit a document.
     *
     * @param  \App\Models\Document  $document
     * @param  int  $userId
     * @return bool
     */
    private function canEditDocument($document, $userId)
    {
        // Only the uploader or an admin can edit the document
        $user = User::find($userId);
        return $document->uploaded_by === $userId || ($user && $user->isAdmin());
    }
    
    /**
     * Check if a user can delete a document.
     *
     * @param  \App\Models\Document  $document
     * @param  int  $userId
     * @return bool
     */
    private function canDeleteDocument($document, $userId)
    {
        // Only the uploader or an admin can delete the document
        $user = User::find($userId);
        return $document->uploaded_by === $userId || ($user && $user->isAdmin());
    }
    
    /**
     * Format bytes to a human-readable format.
     *
     * @param  int  $bytes
     * @param  int  $precision
     * @return string
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
