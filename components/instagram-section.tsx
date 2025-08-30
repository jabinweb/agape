'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink, Heart, MessageCircle, Calendar, X } from 'lucide-react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  permalink: string;
  timestamp: number;
}

interface InstagramResponse {
  success: boolean;
  posts: InstagramPost[];
  username?: string;
  message?: string;
}

interface MasonryItem {
  post: InstagramPost;
  height: number;
  loaded: boolean;
}

export function InstagramSection() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [masonryItems, setMasonryItems] = useState<MasonryItem[]>([]);
  const masonryRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedPost = selectedPostIndex !== null ? posts[selectedPostIndex] : null;

  // Calculate number of columns based on screen width
  const updateColumns = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1024) setColumns(4);
      else if (width >= 640) setColumns(3);
      else setColumns(2);
    }
  }, []);

  // Masonry layout calculation
  const calculateMasonryLayout = useCallback(() => {
    if (!masonryRef.current || masonryItems.length === 0) return;

    const container = masonryRef.current;
    const containerWidth = container.offsetWidth;
    const gap = 16;
    const columnWidth = (containerWidth - gap * (columns - 1)) / columns;
    
    // Initialize column heights
    const columnHeights = new Array(columns).fill(0);
    const items = container.children;

    Array.from(items).forEach((item, index) => {
      const htmlItem = item as HTMLElement;
      if (!htmlItem) return;

      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Position the item
      const x = shortestColumnIndex * (columnWidth + gap);
      const y = columnHeights[shortestColumnIndex];
      
      htmlItem.style.position = 'absolute';
      htmlItem.style.left = `${x}px`;
      htmlItem.style.top = `${y}px`;
      htmlItem.style.width = `${columnWidth}px`;
      
      // Update column height
      columnHeights[shortestColumnIndex] += htmlItem.offsetHeight + gap;
    });

    // Set container height
    const maxHeight = Math.max(...columnHeights);
    container.style.height = `${maxHeight}px`;
  }, [masonryItems, columns]);

  // Handle image load to get actual dimensions
  const handleImageLoad = useCallback((post: InstagramPost, naturalWidth: number, naturalHeight: number) => {
    const aspectRatio = naturalHeight / naturalWidth;
    const baseWidth = 280; // Base width for calculation
    const calculatedHeight = Math.floor(baseWidth * aspectRatio);
    
    setMasonryItems(prev => {
      const existing = prev.find(item => item.post.id === post.id);
      if (existing) {
        return prev.map(item => 
          item.post.id === post.id 
            ? { ...item, height: calculatedHeight, loaded: true }
            : item
        );
      } else {
        return [...prev, { post, height: calculatedHeight, loaded: true }];
      }
    });
  }, []);

  useEffect(() => {
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [updateColumns]);

  useEffect(() => {
    if (masonryItems.every(item => item.loaded)) {
      // Small delay to ensure DOM is updated
      setTimeout(calculateMasonryLayout, 100);
    }
  }, [masonryItems, calculateMasonryLayout]);

  useEffect(() => {
    window.addEventListener('resize', calculateMasonryLayout);
    return () => window.removeEventListener('resize', calculateMasonryLayout);
  }, [calculateMasonryLayout]);

  // Dialog navigation functions
  const openPostDialog = useCallback((postIndex: number) => {
    setSelectedPostIndex(postIndex);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedPostIndex(null);
  }, []);

  const goToPreviousPost = useCallback(() => {
    if (selectedPostIndex !== null && selectedPostIndex > 0) {
      setSelectedPostIndex(selectedPostIndex - 1);
    }
  }, [selectedPostIndex]);

  const goToNextPost = useCallback(() => {
    if (selectedPostIndex !== null && selectedPostIndex < posts.length - 1) {
      setSelectedPostIndex(selectedPostIndex + 1);
    }
  }, [selectedPostIndex, posts.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isDialogOpen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousPost();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextPost();
          break;
        case 'Escape':
          event.preventDefault();
          closeDialog();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen, goToPreviousPost, goToNextPost, closeDialog]);

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        // Try primary API first
        let response = await fetch('/api/instagram/posts?username=atelier_7x&limit=8');
        let data: InstagramResponse = await response.json();
  

        console.log('Fetched Instagram posts:', data.posts);

        if (data.success && data.posts.length > 0) {
          setPosts(data.posts);
          setError(null);
        } else {
          // Use placeholder posts if both APIs fail
          setPosts(data.posts || []);
          setError(data.message || 'Instagram posts temporarily unavailable');
        }
      } catch (err) {
        console.error('Error fetching Instagram posts:', err);
        setError('Failed to load Instagram posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Follow Our Journey</h2>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Stay connected with us on Instagram for behind-the-scenes content, latest artworks, and exclusive updates.
          </p>
          {error && (
            <p className="text-amber-600 text-sm mt-2">
              {error}
            </p>
          )}
        </div>
        
        <div 
          ref={masonryRef}
          className="masonry-container mb-8 max-w-6xl mx-auto relative"
        >
          {loading ? (
            // Loading skeletons
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => {
                const heights = [200, 280, 240, 320, 200, 360, 240, 280];
                return (
                  <Skeleton 
                    key={index} 
                    className="w-full rounded-lg"
                    style={{ height: `${heights[index]}px` }}
                  />
                );
              })}
            </div>
          ) : posts.length > 0 ? (
            // Instagram posts with perfect masonry
            posts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => openPostDialog(index)}
                className="group masonry-item overflow-hidden rounded-lg bg-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || 'Instagram post'}
                    width={280}
                    height={280}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      handleImageLoad(post, img.naturalWidth, img.naturalHeight);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400';
                      handleImageLoad(post, 400, 400); // Square fallback
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback when no posts available
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => {
                const heights = [200, 280, 240, 320, 200, 360, 240, 280];
                return (
                  <div 
                    key={index} 
                    className="bg-gray-200 rounded-lg flex items-center justify-center"
                    style={{ height: `${heights[index]}px` }}
                  >
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Post Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl w-[90vw] h-[85vh] overflow-hidden p-0 fixed-size-dialog">
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Section */}
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-0 overflow-hidden">
                {selectedPost && (
                  <>
                    <div className="relative w-full h-[500px] flex items-center justify-center">
                      <Image
                        src={selectedPost.imageUrl}
                        alt={selectedPost.caption || 'Instagram post'}
                        width={800}
                        height={800}
                        className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                    
                    {/* Fixed Navigation Arrows */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white z-10"
                      onClick={goToPreviousPost}
                      disabled={selectedPostIndex === 0}
                      style={{ opacity: selectedPostIndex === 0 ? 0.3 : 1 }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white z-10"
                      onClick={goToNextPost}
                      disabled={selectedPostIndex === posts.length - 1}
                      style={{ opacity: selectedPostIndex === posts.length - 1 ? 0.3 : 1 }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Info Section */}
              <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-background">
                <DialogHeader className="p-4 border-b flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold">
                      Post Details
                    </DialogTitle>
                  </div>
                </DialogHeader>
                
                {/* Scrollable Content */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0">
                  {selectedPost && (
                    <>
                      {/* Post Stats */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          <span>{selectedPost.likes.toLocaleString()} likes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>{selectedPost.comments.toLocaleString()} comments</span>
                        </div>
                      </div>
                      
                      {/* Post Date */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedPost.timestamp)}</span>
                      </div>
                      
                      {/* Caption */}
                      {selectedPost.caption && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Caption</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedPost.caption}
                          </p>
                        </div>
                      )}
                      
                      {/* Navigation Info */}
                      <div className="text-xs text-muted-foreground">
                        Post {(selectedPostIndex || 0) + 1} of {posts.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Fixed Bottom Buttons - Closer spacing */}
                <div className="p-3 border-t bg-background flex-shrink-0 space-y-2">
                  {selectedPost && (
                    <>
                      <Button 
                        className="w-full h-9 bg-gray-100 hover:bg-gray-300"
                        onClick={() => window.open(selectedPost.permalink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Instagram
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={goToPreviousPost}
                          disabled={selectedPostIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={goToNextPost}
                          disabled={selectedPostIndex === posts.length - 1}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <style jsx>{`
          .masonry-container {
            position: relative;
          }
          
          .masonry-item {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .masonry-item:hover {
            transform: translateY(-2px);
          }
        `}</style>
        
        <style jsx global>{`
          .fixed-size-dialog {
            width: 90vw !important;
            height: 85vh !important;
            max-width: 1200px !important;
            max-height: 85vh !important;
          }
          
          @media (max-width: 768px) {
            .fixed-size-dialog {
              width: 95vw !important;
              height: 90vh !important;
            }
          }
        `}</style>
        
        <div className="text-center">
          <a 
            href="https://www.instagram.com/jabinweb" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Visit @jabinweb
          </a>
        </div>
      </div>
    </section>
  );
}
