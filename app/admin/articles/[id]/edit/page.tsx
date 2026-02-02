'use client';

import { ArticleForm } from '@/components/ArticleForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const { isChecking } = useRequireAuth({ requiredRole: ['admin', 'local_hero'] });

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <ArticleForm articleId={params.id} />;
}
