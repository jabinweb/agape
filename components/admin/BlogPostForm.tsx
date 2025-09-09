'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import MediaSelector from '@/components/admin/media/MediaSelector'
import Image from 'next/image'

interface Category {
  id: string
  name: string
}

interface Author {
  id: string
  name: string | null
  email: string
}

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  slug: string
  isPublished: boolean
  publishDate: string | null
  imageUrl: string | null
  tags: string[]
  categoryId: string | null
  author: {
    id: string
    name: string | null
    email: string
  }
  category: {
    id: string
    name: string
  } | null
}

interface BlogPostFormProps {
  postId?: string
}

export default function BlogPostForm({ postId }: BlogPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(!!postId)
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [newTag, setNewTag] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    isPublished: false,
    publishDate: '',
    imageUrl: '',
    tags: [] as string[],
    categoryId: '',
    authorId: ''
  })

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Fetch categories and authors
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }

        // Fetch authors (staff and admin users)
        const authorsResponse = await fetch('/api/admin/users?roles=ADMIN,STAFF')
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json()
          setAuthors(authorsData.users || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Fetch post data if postId is provided
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/admin/blog/${postId}`)
          if (response.ok) {
            const data = await response.json()
            const post: BlogPost = data.post
            
            setFormData({
              title: post.title || '',
              content: post.content || '',
              excerpt: post.excerpt || '',
              slug: post.slug || '',
              isPublished: post.isPublished || false,
              publishDate: post.publishDate ? new Date(post.publishDate).toISOString().slice(0, 16) : '',
              imageUrl: post.imageUrl || '',
              tags: post.tags || [],
              categoryId: post.categoryId || '',
              authorId: post.author?.id || ''
            })
          } else {
            toast.error('Failed to load blog post')
          }
        } catch (error) {
          console.error('Error fetching post:', error)
          toast.error('Failed to load blog post')
        } finally {
          setFetchLoading(false)
        }
      }
      fetchPost()
    } else {
      setFetchLoading(false)
    }
  }, [postId])

  // Update slug when title changes
  useEffect(() => {
    if (formData.title && !postId) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))
    }
  }, [formData.title, postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : null,
        categoryId: formData.categoryId || null
      }

      const url = postId ? `/api/admin/blog/${postId}` : '/api/admin/blog'
      const method = postId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save blog post')
      }

      toast.success(postId ? 'Blog post updated!' : 'Blog post created!')
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error saving blog post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save blog post')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const handleMediaSelect = (file: any) => {
    setFormData(prev => ({ ...prev, imageUrl: file.url }))
  }

  if (fetchLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading blog post...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            {postId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter blog post title"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-slug"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                URL-friendly version of the title. Auto-generated from title for new posts.
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of the blog post"
                rows={3}
              />
            </div>

            {/* Image Selection */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="flex items-center gap-4">
                <MediaSelector
                  onSelect={handleMediaSelect}
                  selectedUrl={formData.imageUrl}
                  allowedTypes={['image/*']}
                >
                  <Button type="button" variant="outline">
                    {formData.imageUrl ? 'Change Image' : 'Select Image'}
                  </Button>
                </MediaSelector>
                {formData.imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {formData.imageUrl && (
                <div className="mt-2">
                  <Image 
                    src={formData.imageUrl} 
                    alt="Featured image preview" 
                    width={200}
                    height={128}
                    className="max-w-xs h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.categoryId || "none"} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value === "none" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select 
                value={formData.authorId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, authorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name || author.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post content here..."
                rows={15}
                required
              />
            </div>

            {/* Publish Date */}
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <Input
                id="publishDate"
                type="datetime-local"
                value={formData.publishDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Leave empty to publish immediately when marked as published.
              </p>
            </div>

            {/* Published Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
              />
              <Label htmlFor="published">Published</Label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (postId ? 'Update Post' : 'Create Post')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin/blog')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
