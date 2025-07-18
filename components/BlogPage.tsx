import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, User, ArrowRight, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Reflecting on Our Annual Community Food Drive Success",
      excerpt: "This year's community food drive exceeded all expectations, collecting over 5,000 pounds of food donations for local families in need. Here's how our club came together to make it happen.",
      author: "Jennifer Adams",
      date: "March 10, 2025",
      category: "Community Service",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&h=300",
      readTime: "5 min read",
      views: 234
    },
    {
      id: 2,
      title: "New Water Well Project in Guatemala Shows Immediate Impact",
      excerpt: "Six months after completion, our water well project in rural Guatemala is providing clean drinking water to over 1,200 people. Local community leaders share their gratitude and the transformative effects.",
      author: "Michael Chen",
      date: "March 5, 2025",
      category: "International Projects",
      image: "https://images.unsplash.com/photo-1597149840634-2de02abd9c68?auto=format&fit=crop&w=600&h=300",
      readTime: "7 min read",
      views: 456
    },
    {
      id: 3,
      title: "Youth Leadership Academy Graduates First Class",
      excerpt: "Twenty-five local high school students completed our inaugural Youth Leadership Academy program, developing skills in public speaking, project management, and community service leadership.",
      author: "Sarah Wilson",
      date: "February 28, 2025",
      category: "Youth Programs",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?auto=format&fit=crop&w=600&h=300",
      readTime: "4 min read",
      views: 189
    },
    {
      id: 4,
      title: "How Rotary's Four-Way Test Guides Our Business Decisions",
      excerpt: "In this member spotlight, local business owner David Brown shares how applying Rotary's Four-Way Test has transformed his approach to ethical business practices and community engagement.",
      author: "David Brown",
      date: "February 22, 2025",
      category: "Member Spotlight",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&h=300",
      readTime: "6 min read",
      views: 312
    },
    {
      id: 5,
      title: "Partnership with Local Schools Expands Literacy Program",
      excerpt: "Our club's literacy program has expanded to serve three additional elementary schools, thanks to new partnerships with the school district and increased volunteer participation from our members.",
      author: "Amanda White",
      date: "February 15, 2025",
      category: "Education",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&h=300",
      readTime: "5 min read",
      views: 267
    },
    {
      id: 6,
      title: "Global Grant Application: Maternal Health Initiative in Kenya",
      excerpt: "Our club is preparing a Global Grant application to fund a maternal health initiative in rural Kenya, partnering with local Rotary clubs to improve healthcare access for expecting mothers.",
      author: "Lisa Martinez",
      date: "February 8, 2025",
      category: "International Projects",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&h=300",
      readTime: "8 min read",
      views: 145
    }
  ];

  const categories = [
    "All",
    "Community Service",
    "International Projects",
    "Youth Programs",
    "Member Spotlight",
    "Education"
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Community Service': return 'bg-green-100 text-green-800';
      case 'International Projects': return 'bg-red-100 text-red-800';
      case 'Youth Programs': return 'bg-blue-100 text-blue-800';
      case 'Member Spotlight': return 'bg-purple-100 text-purple-800';
      case 'Education': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer hover:bg-red-600 hover:text-white transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative">
                <ImageWithFallback
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <Badge className={`absolute top-4 left-4 ${getCategoryColor(blogPosts[0].category)}`}>
                  Featured
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className={`w-fit mb-4 ${getCategoryColor(blogPosts[0].category)}`}>
                  {blogPosts[0].category}
                </Badge>
                <h2 className="text-3xl font-bold mb-4">{blogPosts[0].title}</h2>
                <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{blogPosts[0].author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{blogPosts[0].date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>{blogPosts[0].views}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{blogPosts[0].readTime}</span>
                </div>

                <Button className="w-fit">
                  Read Full Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <ImageWithFallback
                  src={post.image}
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
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{post.readTime}</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Read More
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>

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