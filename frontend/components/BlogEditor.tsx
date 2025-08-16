import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Switch } from "./ui/switch";
import { BlockEditor } from "./BlockEditor";
import {
  ArrowLeft,
  Save,
  Upload,
  Star,
  X,
  Plus,
} from "lucide-react";
import { apiClient } from "../utils/api";

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

interface BlogEditorProps {
  editingPost?: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
}

export function BlogEditor({ editingPost, onClose, onSave }: BlogEditorProps) {
  // Form states
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

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Block editor content
  const [blockEditorContent, setBlockEditorContent] = useState('');

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
    loadAvailableTags();
    
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        excerpt: editingPost.excerpt,
        content: editingPost.content,
        category: editingPost.category,
        featured_image: editingPost.featured_image || "",
        is_featured: editingPost.is_featured,
        is_published: editingPost.is_published,
        published_at: editingPost.published_at || "",
        tags: editingPost.tags || [],
        meta_description: editingPost.meta_description || "",
      });
      setBlockEditorContent(editingPost.content);
      setSelectedTags(editingPost.tags || []);
    }
  }, [editingPost]);

  const loadAvailableTags = async () => {
    try {
      const response = await apiClient.getBlogPosts({ per_page: 100 });
      if (response.success && response.data) {
        const allTags = new Set<string>();
        response.data.data?.forEach((post: BlogPost) => {
          if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags).sort());
      }
    } catch (err) {
      console.error("Failed to load available tags:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt || !blockEditorContent || !formData.category) {
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

      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Failed to save blog post:", err);
      setError("Failed to save blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          setError(`File ${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(dataUrl);
      }

      setUploadedImages(prev => [...prev, ...newImages]);
      
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Management
            </Button>
            <h1 className="text-2xl font-bold">
              {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardContent className="p-6">
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title..."
                  className="text-2xl font-bold border-none p-0 h-auto text-gray-900 placeholder-gray-400"
                  required
                />
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockEditor
                  initialContent={blockEditorContent}
                  onChange={(htmlContent) => {
                    setBlockEditorContent(htmlContent);
                    setFormData(prev => ({ ...prev, content: htmlContent }));
                  }}
                  uploadedImages={uploadedImages}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <label className="text-sm font-medium">Publish Now</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <label className="text-sm font-medium">Featured Post</label>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="hover:bg-gray-50">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                    className="flex-1 bg-white"
                  />
                  <Button type="button" onClick={addNewCategory} size="sm" variant="outline" className="bg-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag"
                    className="flex-1 bg-white"
                  />
                  <Button type="button" onClick={addNewTag} size="sm" variant="outline" className="bg-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border rounded-lg p-3 max-h-32 overflow-y-auto bg-gray-50">
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
                </div>

                {selectedTags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Selected tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} variant="default" className="bg-blue-600 text-white text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Images */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isUploadingImages ? 'Uploading...' : 'Click to upload images'}
                    </p>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Select Featured Image:</p>
                    <div className="grid grid-cols-2 gap-2">
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
                            className="w-full h-20 object-cover rounded"
                          />
                          {selectedFeaturedImage === imageUrl && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1">
                              <Star className="h-3 w-3" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUploadedImage(imageUrl);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the post..."
                  rows={3}
                  required
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO description (max 160 characters)"
                  maxLength={160}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mt-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
