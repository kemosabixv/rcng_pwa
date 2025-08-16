<?php

namespace App\Http\Controllers\Api;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BlogPostController extends BaseController
{
    /**
     * Display a listing of blog posts.
     */
    public function index(Request $request)
    {
        $params = $this->getPaginationParams($request);

        // Generate cache key based on request parameters
        $cacheKey = 'blog_posts_' . md5(serialize([
            'search' => $request->search,
            'category' => $request->category,
            'status' => $request->status,
            'author_id' => $request->author_id,
            'page' => $request->page,
            'per_page' => $params['per_page'],
            'sort_by' => $params['sort_by'] ?? 'created_at',
            'sort_order' => $params['sort_order'] ?? 'desc',
            'is_authenticated' => $request->user() && $request->user()->canManageBlogs(),
        ]));

        // Cache for 5 minutes for public requests, 1 minute for admin requests
        $cacheTime = ($request->user() && $request->user()->canManageBlogs()) ? 60 : 300;

        $posts = Cache::remember($cacheKey, $cacheTime, function () use ($request, $params) {
            $query = BlogPost::with('author:id,name,email,avatar_url');

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }

            // Filter by category
            if ($request->has('category') && $request->category !== 'all') {
                $query->byCategory($request->category);
            }

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'published') {
                    $query->published();
                } elseif ($request->status === 'draft') {
                    $query->where('is_published', false);
                }
            }

            // Filter by author
            if ($request->has('author_id')) {
                $query->where('author_id', $request->author_id);
            }

            // Default to only published posts for public access
            if (!$request->user() || !$request->user()->canManageBlogs()) {
                $query->published();
            }

            // Order by latest
            $query->orderBy($params['sort_by'] ?? 'created_at', $params['sort_order'] ?? 'desc');

            return $query->paginate($params['per_page']);
        });

        return $this->sendResponse($posts, 'Blog posts retrieved successfully');
    }

    /**
     * Store a newly created blog post.
     */
    public function store(Request $request)
    {
        // Check permissions
        if (!$request->user()->canManageBlogs()) {
            return $this->sendError('Unauthorized. You do not have permission to manage blog posts.', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string',
            'category' => 'required|string|in:' . implode(',', BlogPost::getCategories()),
            'featured_image' => 'nullable|url',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'meta_description' => 'nullable|string|max:160',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $postData = $request->all();
        $postData['author_id'] = $request->user()->id;
        $postData['slug'] = Str::slug($postData['title']);

        // Handle published_at
        if ($postData['is_published'] && !isset($postData['published_at'])) {
            $postData['published_at'] = Carbon::now();
        }

        // Ensure only one featured post at a time
        if ($postData['is_featured']) {
            BlogPost::where('is_featured', true)->update(['is_featured' => false]);
        }

        $post = BlogPost::create($postData);

        // Clear relevant caches
        $this->clearBlogCaches();

        return $this->sendResponse($post->load('author'), 'Blog post created successfully', 201);
    }

    /**
     * Display the specified blog post.
     */
    public function show($slug)
    {
        $post = BlogPost::with('author:id,name,email,avatar_url')
                       ->where('slug', $slug)
                       ->first();

        if (!$post) {
            return $this->sendError('Blog post not found');
        }

        // Check if user can view unpublished posts
        if (!$post->is_published && (!auth()->user() || !auth()->user()->canManageBlogs())) {
            return $this->sendError('Blog post not found');
        }

        // Increment views for published posts
        if ($post->is_published) {
            $post->incrementViews();
        }

        return $this->sendResponse($post, 'Blog post retrieved successfully');
    }

    /**
     * Update the specified blog post.
     */
    public function update(Request $request, $id)
    {
        $post = BlogPost::find($id);

        if (!$post) {
            return $this->sendError('Blog post not found');
        }

        // Check permissions
        if (!$request->user()->canManageBlogs() && $post->author_id !== $request->user()->id) {
            return $this->sendError('Unauthorized. You can only edit your own posts.', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'sometimes|string|max:500',
            'content' => 'sometimes|string',
            'category' => 'sometimes|string|in:' . implode(',', BlogPost::getCategories()),
            'featured_image' => 'nullable|url',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'meta_description' => 'nullable|string|max:160',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $postData = $request->all();

        // Update slug if title changed
        if (isset($postData['title']) && $postData['title'] !== $post->title) {
            $postData['slug'] = Str::slug($postData['title']);
        }

        // Handle publishing
        if (isset($postData['is_published']) && $postData['is_published'] && !$post->is_published) {
            $postData['published_at'] = Carbon::now();
        }

        // Ensure only one featured post at a time
        if (isset($postData['is_featured']) && $postData['is_featured'] && !$post->is_featured) {
            BlogPost::where('is_featured', true)->update(['is_featured' => false]);
        }

        $post->update($postData);

        // Clear relevant caches
        $this->clearBlogCaches();

        return $this->sendResponse($post->load('author'), 'Blog post updated successfully');
    }

    /**
     * Remove the specified blog post.
     */
    public function destroy(Request $request, $id)
    {
        $post = BlogPost::find($id);

        if (!$post) {
            return $this->sendError('Blog post not found');
        }

        // Check permissions
        if (!$request->user()->canManageBlogs() && $post->author_id !== $request->user()->id) {
            return $this->sendError('Unauthorized. You can only delete your own posts.', [], 403);
        }

        $post->delete();

        // Clear relevant caches
        $this->clearBlogCaches();

        return $this->sendResponse([], 'Blog post deleted successfully');
    }

    /**
     * Get blog post statistics.
     */
    public function statistics()
    {
        $stats = Cache::remember('blog_statistics', 300, function () { // Cache for 5 minutes
            $totalPosts = BlogPost::count();
            $publishedPosts = BlogPost::published()->count();
            $draftPosts = BlogPost::where('is_published', false)->count();
            $featuredPosts = BlogPost::featured()->count();
            $totalViews = BlogPost::sum('views');

            // Posts by category
            $postsByCategory = BlogPost::published()
                ->selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category');

            // Recent posts (last 30 days)
            $recentPosts = BlogPost::where('created_at', '>=', Carbon::now()->subDays(30))->count();

            return [
                'total_posts' => $totalPosts,
                'published_posts' => $publishedPosts,
                'draft_posts' => $draftPosts,
                'featured_posts' => $featuredPosts,
                'total_views' => $totalViews,
                'recent_posts' => $recentPosts,
                'posts_by_category' => $postsByCategory,
                'categories' => BlogPost::getCategories(),
            ];
        });

        return $this->sendResponse($stats, 'Blog statistics retrieved successfully');
    }

    /**
     * Get featured blog posts.
     */
    public function featured()
    {
        $featuredPost = Cache::remember('featured_blog_post', 600, function () { // Cache for 10 minutes
            return BlogPost::with('author:id,name,email,avatar_url')
                           ->published()
                           ->featured()
                           ->first();
        });

        return $this->sendResponse($featuredPost, 'Featured blog post retrieved successfully');
    }

    /**
     * Clear all blog-related caches.
     */
    private function clearBlogCaches()
    {
        // Clear specific named caches
        Cache::forget('featured_blog_post');
        Cache::forget('blog_statistics');

        // Clear all blog posts caches (they have dynamic keys)
        Cache::flush(); // This is aggressive but ensures all blog post caches are cleared

        // In production, you might want to use Cache::tags() for more granular control:
        // Cache::tags(['blog_posts'])->flush();
    }
}
