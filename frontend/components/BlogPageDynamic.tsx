import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, User, ArrowRight, Eye, Clock, Filter } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiClient } from '../utils/api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  views: number;
  read_time: number;
  tags: string[];
  meta_description: string;
  author: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}

export function BlogPageDynamic() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const categories = [
    'All',
    'Community Service',
    'International Projects',
    'Youth Programs',
    'Member Spotlight',
    'Education',
    'Club News',
    'Events'
  ];

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPost();
    fetchAvailableTags();
  }, [selectedCategory, selectedTags, currentPage]);

  const fetchAvailableTags = async () => {
    try {
      // Extract tags from all posts for now - this could be optimized with a dedicated API endpoint
      const response = await apiClient.getPublicBlogPosts({ per_page: 100 });

      if (response.success && response.data?.data) {
        const allTags = new Set<string>();
        response.data.data.forEach((post: BlogPost) => {
          if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
          }
        });
        const sortedTags = Array.from(allTags).sort();
        setAvailableTags(sortedTags);
      }
    } catch (error) {
      console.error('Failed to fetch available tags:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: 9,
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') })
      };

      // Use apiClient for proper CORS and error handling
      console.log('🌐 Fetching blog posts with params:', params);

      const response = await apiClient.getPublicBlogPosts(params);

      if (response.success && response.data) {
        setPosts(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      } else {
        console.error('API returned unsuccessful response:', response);
        // Fallback to empty data for development
        setPosts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to connect to server';
      setError(errorMessage);
      // Set fallback data for development
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPost = async () => {
    try {
      console.log('🌟 Fetching featured post');

      const response = await apiClient.getPublicFeaturedBlogPost();

      if (response.success && response.data) {
        setFeaturedPost(response.data);
      } else {
        console.warn('No featured post available or server error:', response.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to fetch featured post:', err);
      // Silently fail for featured post as it's optional
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReadMore = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    setCurrentPage(1);
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Blog Posts</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-red-600 text-white">Blog</Badge>
          <h1 className="text-4xl font-bold mb-6">Stories of Service</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Read about our latest projects, member spotlights, and the impact we're making in our community and around the world
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Category:</span>
            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-48 bg-white">
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
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tags:</span>
            <Select onValueChange={handleTagFilter}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Select tags" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag} className="hover:bg-gray-50">
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(selectedCategory !== 'All' || selectedTags.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                clearTagFilters();
              }}
              className="bg-white"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'All' || selectedTags.length > 0) && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {selectedCategory !== 'All' && (
              <Badge variant="default" className="bg-red-600 text-white">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="ml-2 hover:bg-red-700 rounded-full"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="default" className="bg-blue-600 text-white">
                Tag: {tag}
                <button
                  onClick={() => handleTagFilter(tag)}
                  className="ml-2 hover:bg-blue-700 rounded-full"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative">
                  <ImageWithFallback
                    src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&h=300'}
                    alt={featuredPost.title}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <Badge className={`w-fit mb-4 ${getCategoryColor(featuredPost.category)}`}>
                    {featuredPost.category}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                  <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(featuredPost.published_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>{featuredPost.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.read_time} min read</span>
                    </div>
                  </div>

                  <Button className="w-fit" onClick={() => handleReadMore(featuredPost.slug)}>
                    Read Full Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <ImageWithFallback
                    src={post.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&h=300'}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className={`absolute top-4 left-4 ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.read_time} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleReadMore(post.slug)}
                    >
                      Read More
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No blog posts found</h3>
            <p className="text-muted-foreground">
              {selectedCategory !== 'All' 
                ? `No posts found in the "${selectedCategory}" category.`
                : 'No blog posts have been published yet.'
              }
            </p>
          </div>
        )}

        {/* Load More */}
        {currentPage < totalPages && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Articles'}
            </Button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter to get the latest updates on our projects, 
                events, and community impact stories delivered to your inbox.
              </p>
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Subscribe to Newsletter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
