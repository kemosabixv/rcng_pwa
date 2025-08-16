import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Switch } from "./ui/switch";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  BarChart3,
  Star,
  FileText,
  Tag,
  Upload,
  X,
  Plus,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../utils/api";
import { BlogEditor } from "./BlogEditor";
import { BlockEditor } from "./BlockEditor";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image?: string;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  views: number;
  read_time: number;
  tags?: string[];
  meta_description?: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

interface BlogStatistics {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  featured_posts: number;
  total_views: number;
  recent_posts: number;
  posts_by_category: Record<string, number>;
  categories: string[];
}

export function BlogManagement() {
  // Auth context
  const { user } = useAuth();

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [statistics, setStatistics] = useState<BlogStatistics | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAuthor, setFilterAuthor] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  // Editor view state
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    featured_image: "",
    is_featured: false,
    is_published: false,
    published_at: "",
    tags: [] as string[],
    meta_description: "",
  });

  // Image upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedFeaturedImage, setSelectedFeaturedImage] = useState<string>("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Category and tag management
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [managedCategories, setManagedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Category/Tag deletion states
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'category' | 'tag', name: string} | null>(null);
  const [deletionCascadeInfo, setDeletionCascadeInfo] = useState<{affectedPosts: number} | null>(null);

  // Modal states
  const [categoryManagementModal, setCategoryManagementModal] = useState(false);
  const [tagManagementModal, setTagManagementModal] = useState(false);

  // Editor state
  const [blockEditorContent, setBlockEditorContent] = useState("");

  const defaultCategories = [
    "Community Service",
    "International Projects",
    "Youth Programs",
    "Member Spotlight",
    "Education",
    "Club News",
    "Events",
  ];

  const categories = [...defaultCategories, ...managedCategories].filter((cat, index, arr) => arr.indexOf(cat) === index);

  useEffect(() => {
    loadBlogPosts();
    loadStatistics();
    loadAvailableTags();
  }, [currentPage, searchTerm, filterCategory, filterStatus, filterAuthor]);

  const loadAvailableTags = async () => {
    try {
      // For now, extract tags from existing posts
      const response = await apiClient.getBlogPosts({ per_page: 100 });
      const data = handleApiResponse(response);
      const allTags = new Set<string>();
      data.data?.forEach((post: BlogPost) => {
        if (post.tags) {
          post.tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags).sort());
    } catch (err) {
      console.error("Failed to load available tags:", err);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`File ${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        // For now, create a data URL for demo purposes
        // In production, you'd upload to a file storage service
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newImages.push(dataUrl);
      }

      setUploadedImages(prev => [...prev, ...newImages]);

      // Auto-select first uploaded image as featured if none selected
      if (!selectedFeaturedImage && newImages.length > 0) {
        setSelectedFeaturedImage(newImages[0]);
        setFormData(prev => ({ ...prev, featured_image: newImages[0] }));
      }

    } catch (err) {
      console.error('Failed to upload images:', err);
      setError('Failed to upload images');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const selectFeaturedImage = (imageUrl: string) => {
    setSelectedFeaturedImage(imageUrl);
    setFormData(prev => ({ ...prev, featured_image: imageUrl }));
  };

  const removeUploadedImage = (imageUrl: string) => {
    setUploadedImages(prev => prev.filter(img => img !== imageUrl));
    if (selectedFeaturedImage === imageUrl) {
      setSelectedFeaturedImage("");
      setFormData(prev => ({ ...prev, featured_image: "" }));
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setManagedCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const addNewTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      setAvailableTags(prev => [...prev, newTag.trim()].sort());
      setNewTag("");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const initiateDelete = async (type: 'category' | 'tag', name: string) => {
    try {
      // Check how many posts would be affected
      const response = await apiClient.getBlogPosts({
        [type]: name,
        per_page: 1000 // Get all to count
      });
      const data = handleApiResponse(response);
      const affectedPosts = data.total || 0;

      setItemToDelete({ type, name });
      setDeletionCascadeInfo({ affectedPosts });
      setDeleteConfirmDialog(true);
    } catch (err) {
      console.error(`Failed to check ${type} usage:`, err);
      setError(`Failed to check ${type} usage`);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setLoading(true);
      setError("");

      // In a real implementation, you would have dedicated API endpoints for this
      // For now, we'll simulate the deletion by updating local state

      if (itemToDelete.type === 'category') {
        // Remove from managed categories
        setManagedCategories(prev => prev.filter(cat => cat !== itemToDelete.name));

        // In a real app, you would call an API endpoint that:
        // 1. Deletes the category
        // 2. Either deletes or reassigns posts with that category
        console.log(`Would delete category "${itemToDelete.name}" and ${deletionCascadeInfo?.affectedPosts} posts`);

      } else if (itemToDelete.type === 'tag') {
        // Remove from available tags
        setAvailableTags(prev => prev.filter(tag => tag !== itemToDelete.name));

        // In a real app, you would call an API endpoint that:
        // 1. Removes the tag from all posts
        // 2. Deletes the tag
        console.log(`Would delete tag "${itemToDelete.name}" from ${deletionCascadeInfo?.affectedPosts} posts`);
      }

      setSuccess(`${itemToDelete.type === 'category' ? 'Category' : 'Tag'} deleted successfully`);

      // Refresh data
      loadBlogPosts();
      loadAvailableTags();

    } catch (err) {
      console.error(`Failed to delete ${itemToDelete.type}:`, err);
      setError(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setLoading(false);
      setDeleteConfirmDialog(false);
      setItemToDelete(null);
      setDeletionCascadeInfo(null);
    }
  };

  const toggleFeaturedStatus = async (post: BlogPost) => {
    try {
      setLoading(true);
      setError("");

      // If setting as featured, first unfeatured any existing featured post
      if (!post.is_featured) {
        // Find currently featured posts and unfeatured them
        const currentlyFeatured = blogPosts.find(p => p.is_featured && p.id !== post.id);
        if (currentlyFeatured) {
          await apiClient.updateBlogPost(currentlyFeatured.id, {
            ...currentlyFeatured,
            is_featured: false
          });
        }
      }

      // Toggle the featured status of the selected post
      const updatedPost = {
        ...post,
        is_featured: !post.is_featured
      };

      await apiClient.updateBlogPost(post.id, updatedPost);

      setSuccess(`Post ${post.is_featured ? 'removed from' : 'set as'} featured successfully`);

      // Refresh the blog posts list
      loadBlogPosts();

    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      setError('Failed to update featured status');
    } finally {
      setLoading(false);
    }
  };

  const handleApiResponse = (response: any) => {
    if (!response.success) {
      throw new Error(response.error || 'API request failed');
    }
    return response.data;
  };

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBlogPosts({
        search: searchTerm || undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        author_id: filterAuthor !== "all" ? filterAuthor : undefined,
        page: currentPage,
        per_page: postsPerPage,
      });
      
      const data = handleApiResponse(response);
      setBlogPosts(data.data || []);
      setTotalPosts(data.total || 0);
    } catch (err) {
      console.error("Failed to load blog posts:", err);
      setError("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiClient.getBlogStatistics();
      const data = handleApiResponse(response);
      setStatistics(data);
    } catch (err) {
      console.error("Failed to load blog statistics:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const submitData = {
        ...formData,
        content: blockEditorContent,
        tags: selectedTags,
      };

      if (editingPost) {
        await apiClient.updateBlogPost(editingPost.id, submitData);
        setSuccess("Blog post updated successfully");
      } else {
        await apiClient.createBlogPost(submitData);
        setSuccess("Blog post created successfully");
      }

      setCurrentView('list');
      resetForm();
      loadBlogPosts();
      loadStatistics();
    } catch (err: any) {
      setError(err.message || "Failed to save blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    try {
      setLoading(true);
      await apiClient.deleteBlogPost(post.id);
      setSuccess("Blog post deleted successfully");
      loadBlogPosts();
      loadStatistics();
    } catch (err: any) {
      setError(err.message || "Failed to delete blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      featured_image: post.featured_image || '',
      is_featured: post.is_featured,
      is_published: post.is_published,
      published_at: post.published_at || '',
      tags: post.tags || [],
      meta_description: post.meta_description || '',
    });
    setSelectedTags(post.tags || []);
    setBlockEditorContent(post.content);
    setCurrentView('editor');
  };

  const handleNewPost = () => {
    resetForm();
    setCurrentView('editor');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    resetForm();
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      featured_image: "",
      is_featured: false,
      is_published: false,
      published_at: "",
      tags: [],
      meta_description: "",
    });
    setUploadedImages([]);
    setSelectedFeaturedImage("");
    setSelectedTags([]);
    setNewCategory("");
    setNewTag("");
    setBlockEditorContent("");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Community Service': return 'bg-green-100 text-green-800';
      case 'International Projects': return 'bg-red-100 text-red-800';
      case 'Youth Programs': return 'bg-blue-100 text-blue-800';
      case 'Member Spotlight': return 'bg-purple-100 text-purple-800';
      case 'Education': return 'bg-yellow-100 text-yellow-800';
      case 'Club News': return 'bg-indigo-100 text-indigo-800';
      case 'Events': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateToWords = (text: string, wordCount: number = 10): string => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // Check if user can manage blogs
  if (!user || !['admin', 'blog_manager'].includes(user.role)) {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to manage blog posts. Contact an administrator for access.
        </AlertDescription>
      </Alert>
    );
  }

  // EDITOR VIEW - Full page editor
  if (currentView === 'editor') {
    return (
      <div className="space-y-6">
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
            <div>
              <h2 className="text-2xl font-bold">
                {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <p className="text-muted-foreground">
                {editingPost ? `Editing: ${editingPost.title}` : "Create a new blog post with the block editor"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button type="submit" form="blog-form" variant="outline" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button type="submit" form="blog-form" disabled={loading}>
              {loading ? "Saving..." : editingPost ? "Update Post" : "Publish Post"}
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Full Page Editor Form */}
        <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter post title"
                    required
                    className="text-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Add new category */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Add new category"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addNewCategory} size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Meta Description</label>
                  <Input
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="SEO description (max 160 characters)"
                    maxLength={160}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Excerpt *</label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief description of the post..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <label className="text-sm font-medium">Featured Post</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <label className="text-sm font-medium">Publish Now</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Images</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploadingImages}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-2">
                    {isUploadingImages ? 'Uploading...' : 'Click to upload images or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>

              {/* Uploaded Images Grid */}
              {uploadedImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Select Featured Image:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className={`relative border-2 rounded cursor-pointer ${
                          selectedFeaturedImage === imageUrl ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => selectFeaturedImage(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        {selectedFeaturedImage === imageUrl && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
                            <Star className="h-4 w-4" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUploadedImage(imageUrl);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add new tag */}
              <div className="flex gap-2 mb-4">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1"
                />
                <Button type="button" onClick={addNewTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Available tags */}
              <div className="border rounded-lg p-4 max-h-40 overflow-y-auto bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white hover:bg-blue-50'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                {availableTags.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tags available. Add one above.
                  </p>
                )}
              </div>

              {/* Selected tags display */}
              {selectedTags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="default" className="bg-blue-600 text-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-lg p-6 min-h-[400px] bg-white">
                <BlockEditor
                  initialContent={blockEditorContent}
                  onChange={(htmlContent) => {
                    setBlockEditorContent(htmlContent);
                    setFormData(prev => ({ ...prev, content: htmlContent }));
                  }}
                  uploadedImages={uploadedImages}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  // LIST VIEW - Blog management dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">
            Create and manage blog posts for your organization
          </p>
        </div>
        <Button onClick={handleNewPost}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{statistics.total_posts}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{statistics.published_posts}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">{statistics.draft_posts}</p>
                </div>
                <Edit className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{statistics.total_views.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category and Tag Management Buttons */}
      <div className="flex gap-4">
        <Dialog open={categoryManagementModal} onOpenChange={setCategoryManagementModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Manage Categories
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category Management
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  className="flex-1"
                />
                <Button onClick={addNewCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Existing Categories:</h4>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{category}</span>
                      {!defaultCategories.includes(category) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateDelete('category', category)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={tagManagementModal} onOpenChange={setTagManagementModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Manage Tags
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tag Management
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1"
                />
                <Button onClick={addNewTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Existing Tags:</h4>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>{tag}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => initiateDelete('tag', tag)}
                        className="h-4 w-4 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {availableTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags created yet.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deletion Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the {itemToDelete?.type} "{itemToDelete?.name}"?
            </p>

            {deletionCascadeInfo && deletionCascadeInfo.affectedPosts > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>Warning:</strong> This will affect {deletionCascadeInfo.affectedPosts} blog post(s).
                  Posts with this {itemToDelete?.type} will be deleted permanently.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadBlogPosts}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({totalPosts})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading blog posts...</div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No blog posts found. Create your first post to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {truncateToWords(post.excerpt, 10)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(post.category)}>
                        {post.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{post.author.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={post.is_featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFeaturedStatus(post)}
                        disabled={loading}
                        className={post.is_featured ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                      >
                        <Star className={`h-4 w-4 ${post.is_featured ? 'fill-current' : ''}`} />
                        {post.is_featured ? 'Featured' : 'Set Featured'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPosts > postsPerPage && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {Math.ceil(totalPosts / postsPerPage)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalPosts / postsPerPage)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
