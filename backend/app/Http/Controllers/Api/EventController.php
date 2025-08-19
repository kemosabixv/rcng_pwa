<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventController extends BaseController
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Event::with('creator:id,name,email');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('type') && $request->type !== 'all') {
                $query->ofType($request->type);
            }

            if ($request->has('category') && $request->category !== 'all') {
                $query->ofCategory($request->category);
            }

            if ($request->has('visibility') && $request->visibility !== 'all') {
                $query->where('visibility', $request->visibility);
            }

            if ($request->has('timeframe')) {
                switch ($request->timeframe) {
                    case 'upcoming':
                        $query->upcoming();
                        break;
                    case 'past':
                        $query->past();
                        break;
                    case 'ongoing':
                        $query->ongoing();
                        break;
                }
            }

            if ($request->has('featured')) {
                $query->featured();
            }

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('location', 'LIKE', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'start_date');
            $sortOrder = $request->get('sort_order', 'asc');
            
            if (in_array($sortBy, ['title', 'start_date', 'end_date', 'created_at', 'type', 'status'])) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('start_date', 'asc');
            }

            // Pagination
            $perPage = min($request->get('per_page', 15), 100);
            $events = $query->paginate($perPage);

            return $this->sendResponse($events, 'Events retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve events: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Display a listing of public events.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        try {
            $query = Event::published()
                          ->public()
                          ->with('creator:id,name');

            // Apply public filters
            if ($request->has('type') && $request->type !== 'all') {
                $query->ofType($request->type);
            }

            if ($request->has('category') && $request->category !== 'all') {
                $query->ofCategory($request->category);
            }

            if ($request->has('timeframe')) {
                switch ($request->timeframe) {
                    case 'upcoming':
                        $query->upcoming();
                        break;
                    case 'past':
                        $query->past();
                        break;
                }
            }

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('location', 'LIKE', "%{$search}%");
                });
            }

            // Default sorting for public view
            $query->orderBy('start_date', 'asc');

            // Pagination
            $perPage = min($request->get('per_page', 12), 50);
            $events = $query->paginate($perPage);

            return $this->sendResponse($events, 'Public events retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve public events: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'excerpt' => 'nullable|string|max:500',
                'type' => 'required|in:meeting,service,fundraiser,social,training,conference',
                'category' => 'required|in:club_service,community_service,international_service,vocational_service',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'all_day' => 'boolean',
                'location' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:500',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'max_attendees' => 'nullable|integer|min:1',
                'registration_fee' => 'nullable|numeric|min:0',
                'registration_deadline' => 'nullable|date|before:start_date',
                'requires_registration' => 'boolean',
                'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'required|in:draft,published,cancelled,completed',
                'visibility' => 'required|in:public,members_only,private',
                'is_featured' => 'boolean',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
                'notes' => 'nullable|string',
                'contact_info' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), 422);
            }

            $data = $validator->validated();
            $data['created_by'] = auth()->id();

            // Generate unique slug
            $data['slug'] = $this->generateUniqueSlug($data['title']);

            // Handle featured image upload
            if ($request->hasFile('featured_image')) {
                $image = $request->file('featured_image');
                $imagePath = $image->store('events', 'public');
                $data['featured_image'] = $imagePath;
            }

            $event = Event::create($data);

            return $this->sendResponse($event->load('creator:id,name,email'), 'Event created successfully', 201);

        } catch (\Exception $e) {
            return $this->sendError('Failed to create event: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event): JsonResponse
    {
        try {
            $event->load('creator:id,name,email');
            return $this->sendResponse($event, 'Event retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve event: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Display the specified public event.
     */
    public function publicShow(string $slug): JsonResponse
    {
        try {
            $event = Event::where('slug', $slug)
                         ->published()
                         ->public()
                         ->with('creator:id,name')
                         ->firstOrFail();

            return $this->sendResponse($event, 'Event retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Event not found', [], 404);
        }
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'excerpt' => 'nullable|string|max:500',
                'type' => 'sometimes|required|in:meeting,service,fundraiser,social,training,conference',
                'category' => 'sometimes|required|in:club_service,community_service,international_service,vocational_service',
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after_or_equal:start_date',
                'all_day' => 'boolean',
                'location' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:500',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'max_attendees' => 'nullable|integer|min:1',
                'registration_fee' => 'nullable|numeric|min:0',
                'registration_deadline' => 'nullable|date|before:start_date',
                'requires_registration' => 'boolean',
                'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'sometimes|required|in:draft,published,cancelled,completed',
                'visibility' => 'sometimes|required|in:public,members_only,private',
                'is_featured' => 'boolean',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
                'notes' => 'nullable|string',
                'contact_info' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), 422);
            }

            $data = $validator->validated();

            // Update slug if title changed
            if (isset($data['title']) && $data['title'] !== $event->title) {
                $data['slug'] = $this->generateUniqueSlug($data['title'], $event->id);
            }

            // Handle featured image upload
            if ($request->hasFile('featured_image')) {
                // Delete old image if exists
                if ($event->featured_image) {
                    Storage::disk('public')->delete($event->featured_image);
                }

                $image = $request->file('featured_image');
                $imagePath = $image->store('events', 'public');
                $data['featured_image'] = $imagePath;
            }

            $event->update($data);

            return $this->sendResponse($event->load('creator:id,name,email'), 'Event updated successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to update event: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event): JsonResponse
    {
        try {
            // Delete featured image if exists
            if ($event->featured_image) {
                Storage::disk('public')->delete($event->featured_image);
            }

            $event->delete();

            return $this->sendResponse([], 'Event deleted successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to delete event: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get featured events.
     */
    public function featured(): JsonResponse
    {
        try {
            $events = Event::published()
                          ->public()
                          ->featured()
                          ->upcoming()
                          ->with('creator:id,name')
                          ->orderBy('start_date', 'asc')
                          ->limit(5)
                          ->get();

            return $this->sendResponse($events, 'Featured events retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve featured events: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get event statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total' => Event::count(),
                'published' => Event::where('status', 'published')->count(),
                'draft' => Event::where('status', 'draft')->count(),
                'upcoming' => Event::upcoming()->count(),
                'ongoing' => Event::ongoing()->count(),
                'past' => Event::past()->count(),
                'public' => Event::where('visibility', 'public')->count(),
                'members_only' => Event::where('visibility', 'members_only')->count(),
                'by_type' => Event::select('type')
                    ->selectRaw('COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type'),
                'by_category' => Event::select('category')
                    ->selectRaw('COUNT(*) as count')
                    ->groupBy('category')
                    ->pluck('count', 'category'),
            ];

            return $this->sendResponse($stats, 'Event statistics retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve statistics: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Generate a unique slug for the event.
     */
    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        $query = Event::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
            
            $query = Event::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }
}
