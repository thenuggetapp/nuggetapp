'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client-browser';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';

interface ArticleFormProps {
  articleId?: string;
}

export function ArticleForm({ articleId }: ArticleFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!articleId);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    hero_image_url: '',
    category: '',
    published: false,
    featured: false,
    meta_description: '',
  });

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('id', articleId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Article not found');
        router.push('/admin/articles');
        return;
      }

      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        hero_image_url: data.hero_image_url || '',
        category: data.category || '',
        published: data.published || false,
        featured: data.featured || false,
        meta_description: data.meta_description || '',
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
    } finally {
      setInitialLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    if (!user || !userProfile) {
      toast.error('You must be logged in to create articles');
      return;
    }

    setLoading(true);

    try {
      const articleData = {
        ...formData,
        author_id: user.id,
        published_at: formData.published ? new Date().toISOString() : null,
      };

      if (articleId) {
        const { error } = await supabase
          .from('blog_articles')
          .update(articleData)
          .eq('id', articleId);

        if (error) throw error;
        toast.success('Article updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_articles')
          .insert(articleData);

        if (error) throw error;
        toast.success('Article created successfully');
      }

      router.push('/admin/articles');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving article:', error);
      if (error.code === '23505') {
        toast.error('An article with this slug already exists');
      } else {
        toast.error(error.message || 'Failed to save article');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading article...</div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <Link href="/admin/articles">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              {articleId ? 'Edit Article' : 'Create New Article'}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6 max-w-5xl mx-auto">

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="article-url-slug"
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                URL: /article/{formData.slug || 'article-url-slug'}
              </p>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Chicago, New York, Tips"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Short description for article listings"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hero Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImageUrl={formData.hero_image_url}
              onImageChange={(url) => setFormData(prev => ({ ...prev, hero_image_url: url }))}
              label="Article Hero Image"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content *</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Write your article content here. Use the toolbar buttons to format, or type HTML directly."
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="SEO description for search engines"
                rows={3}
              />
              <p className="text-sm text-slate-500 mt-1">
                {formData.meta_description.length} / 160 characters recommended
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Publish Article</Label>
                <p className="text-sm text-slate-500">Make this article visible to the public</p>
              </div>
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured Article</Label>
                <p className="text-sm text-slate-500">Show as featured on blog homepage</p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#8dbf65] hover:bg-[#7aad52]"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : articleId ? 'Update Article' : 'Create Article'}
          </Button>
          <Link href="/admin/articles">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
          </div>
        </div>
      </div>
    </div>
  );
}
