import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

async function getArticle(slug: string) {
  const supabase = createClient();

  const { data: article, error } = await supabase
    .from('blog_articles')
    .select(`
      *,
      author:user_profiles(
        id,
        full_name,
        email
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !article) {
    return null;
  }

  return article;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | The Nugget`,
    description: article.meta_description || article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.meta_description || article.excerpt || article.title,
      images: article.hero_image_url ? [article.hero_image_url] : [],
    },
  };
}

function cleanArticleContent(html: string): string {
  if (!html) return '';

  let cleaned = html;

  cleaned = cleaned.replace(/<div>/g, '<p>').replace(/<\/div>/g, '</p>');
  cleaned = cleaned.replace(/(<br\s*\/?>\s*){2,}/g, '</p><p>');

  if (cleaned && !cleaned.match(/^<(p|h[1-6]|ul|ol|blockquote|pre)/)) {
    cleaned = `<p>${cleaned}</p>`;
  }

  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');

  return cleaned;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const authorName = article.author?.full_name || article.author?.email?.split('@')[0] || 'The Nugget Team';
  const publishedDate = article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : '';
  const cleanedContent = cleanArticleContent(article.content || '');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <article className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Badge */}
        {article.category && (
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 bg-[#8dbf65] text-white text-sm font-medium rounded-full">
              {article.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-sm">By {authorName}</span>
          </div>
          {publishedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{publishedDate}</span>
            </div>
          )}
        </div>

        {/* Hero Image */}
        {article.hero_image_url && (
          <div className="mb-12 -mx-4 sm:mx-0">
            <img
              src={article.hero_image_url}
              alt={article.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="text-xl text-slate-700 mb-8 leading-relaxed font-serif italic border-l-4 border-[#8dbf65] pl-6 py-2">
            {article.excerpt}
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:font-serif
            prose-a:text-[#8dbf65] prose-a:underline prose-a:font-semibold prose-a:transition-colors hover:prose-a:text-[#7aad52]
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-slate-700 prose-li:mb-2 prose-li:font-serif
            prose-blockquote:border-l-4 prose-blockquote:border-[#8dbf65] prose-blockquote:pl-6 prose-blockquote:italic
            prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
          "
          dangerouslySetInnerHTML={{ __html: cleanedContent }}
        />

        {/* Share Section */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Written by</p>
              <p className="text-lg font-semibold text-slate-900">{authorName}</p>
            </div>
            <a
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-[#8dbf65] hover:bg-[#7aad52] text-white font-medium rounded-lg transition-colors"
            >
              View All Articles
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
