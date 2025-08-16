<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CommitteeController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\DueController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\QuotationController;
use App\Http\Controllers\Api\BlogPostController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/avatar', [AuthController::class, 'updateAvatar']);
    
    // Users
    Route::apiResource('users', UserController::class);
    Route::put('users/{user}/status', [UserController::class, 'updateStatus']);
    Route::get('statistics/users', [UserController::class, 'statistics']);
    
    // Committees
    Route::apiResource('committees', CommitteeController::class);
    Route::post('committees/{committee}/members', [CommitteeController::class, 'addMembers']);
    Route::delete('committees/{committee}/members', [CommitteeController::class, 'removeMembers']);
    Route::put('committees/{committee}/members/{user}/role', [CommitteeController::class, 'updateMemberRole']);
    Route::get('committees/{committee}/statistics', [CommitteeController::class, 'statistics']);
    
    // Projects
    Route::apiResource('projects', ProjectController::class);
    Route::post('projects/{project}/members', [ProjectController::class, 'addMembers']);
    Route::delete('projects/{project}/members', [ProjectController::class, 'removeMembers']);
    Route::put('projects/{project}/progress', [ProjectController::class, 'updateProgress']);
    Route::post('projects/{project}/complete', [ProjectController::class, 'complete']);
    Route::get('projects/{project}/statistics', [ProjectController::class, 'statistics']);
    
    // Dues
    Route::apiResource('dues', DueController::class);
    Route::post('dues/{due}/pay', [DueController::class, 'markAsPaid']);
    Route::get('users/{user}/dues/summary', [DueController::class, 'userSummary']);
    Route::get('dues/statistics', [DueController::class, 'statistics']);
    Route::get('dues/overdue', [DueController::class, 'overdue']);
    Route::post('dues/{due}/remind', [DueController::class, 'sendReminder']);
    Route::post('dues/{due}/waive', [DueController::class, 'waive']);
    
    // Documents
    Route::apiResource('documents', DocumentController::class);
    Route::get('documents/{document}/download', [DocumentController::class, 'download']);
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview']);
    Route::post('documents/{document}/replace', [DocumentController::class, 'replaceFile']);
    Route::get('statistics/documents', [DocumentController::class, 'statistics']);
    
    // Quotations
    Route::apiResource('quotations', QuotationController::class);
    Route::post('quotations/{quotation}/items', [QuotationController::class, 'addItems']);
    Route::put('quotations/{quotation}/items/{item}', [QuotationController::class, 'updateItem']);
    Route::delete('quotations/{quotation}/items/{item}', [QuotationController::class, 'removeItem']);
    Route::post('quotations/{quotation}/send', [QuotationController::class, 'markAsSent']);
    Route::post('quotations/{quotation}/accept', [QuotationController::class, 'accept']);
    Route::post('quotations/{quotation}/reject', [QuotationController::class, 'reject']);
    Route::post('quotations/{quotation}/duplicate', [QuotationController::class, 'duplicate']);
    Route::get('statistics/quotations', [QuotationController::class, 'statistics']);

    // Blog Posts (Admin/Blog Manager only)
    Route::apiResource('blog-posts', BlogPostController::class);
    Route::get('blog-posts/featured/current', [BlogPostController::class, 'featured']);
    Route::get('statistics/blog-posts', [BlogPostController::class, 'statistics']);
});

// Public access routes
Route::get('public/members', [UserController::class, 'publicIndex'])
    ->name('public.members.index');
Route::get('public/documents/{document}/download', [DocumentController::class, 'publicDownload'])
    ->name('public.documents.download');
Route::get('public/documents/{document}/preview', [DocumentController::class, 'publicPreview'])
    ->name('public.documents.preview');

// Public blog routes
Route::get('public/blog-posts', [BlogPostController::class, 'index'])
    ->name('public.blog-posts.index');
Route::get('public/blog-posts/{slug}', [BlogPostController::class, 'show'])
    ->name('public.blog-posts.show');
Route::get('public/blog-posts/featured/current', [BlogPostController::class, 'featured'])
    ->name('public.blog-posts.featured');

// Test email route (remove in production)
if (app()->environment('local')) {
    Route::get('/test-email', function () {
        $details = [
            'name' => 'Test User',
            'email' => 'test@example.com'
        ];

        \Mail::to($details['email'])->send(new \App\Mail\TestEmail($details));

        return response()->json([
            'success' => true,
            'message' => 'Test email sent successfully!',
            'to' => $details['email']
        ]);
    });
}
