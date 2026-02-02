'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { createClient } from '@/lib/supabase/client-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/AdminSidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  author: {
    full_name: string | null;
    email: string;
  } | null;
}

export default function ArticlesManagementPage() {
  const { user, userProfile, isChecking } = useRequireAuth({ requiredRole: ['admin', 'local_hero'] });
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isChecking && user) {
      fetchArticles();
    }
  }, [isChecking, user]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          id,
          title,
          slug,
          category,
          published,
          published_at,
          created_at,
          author:user_profiles!blog_articles_author_id_fkey(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data as any || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;

    try {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', articleToDelete);

      if (error) throw error;

      toast.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Articles</h1>
          <p className="text-slate-600 mt-2">Create, edit, and manage blog articles</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-[#8dbf65] hover:bg-[#7aad52]">
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search articles by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-600">
                  No articles found. Create your first article to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => {
                const authorName = article.author?.full_name || article.author?.email?.split('@')[0] || 'Unknown';

                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      {article.category ? (
                        <Badge variant="outline">{article.category}</Badge>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>{authorName}</TableCell>
                    <TableCell>
                      {article.published ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {article.published_at
                        ? format(new Date(article.published_at), 'MMM d, yyyy')
                        : 'Not published'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {article.published && (
                          <Link href={`/article/${article.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setArticleToDelete(article.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
