import { createClient } from '@/lib/supabase/server';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getArticles() {
  try {
    const supabase = createClient();

    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select(`
        *,
        author:user_profiles(
          full_name,
          email
        )
      `)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    return articles || [];
  } catch (error) {
    console.error('Error in getArticles:', error);
    return [];
  }
}

export const metadata = {
  title: 'Blog | The Nugget',
  description: 'Discover family-friendly dining guides, restaurant recommendations, and tips for eating out with kids.',
};

export default async function BlogPage() {
  const articles = await getArticles();
  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const regularArticles = articles.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MarketingHeader />

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">The Nugget Blog</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Family-friendly dining guides, restaurant recommendations, and tips for eating out with kids
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <Link href={`/article/${featuredArticle.slug}`}>
            <div className="mb-16 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              <div className="grid md:grid-cols-2 gap-8">
                {featuredArticle.hero_image_url && (
                  <div className="h-64 md:h-full">
                    <img
                      src={featuredArticle.hero_image_url}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`p-8 flex flex-col justify-center ${!featuredArticle.hero_image_url ? 'md:col-span-2' : ''}`}>
                  {featuredArticle.category && (
                    <span className="inline-block w-fit px-4 py-1.5 bg-[#8dbf65] text-white text-sm font-medium rounded-full mb-4">
                      {featuredArticle.category}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    {featuredArticle.title}
                  </h2>
                  {featuredArticle.excerpt && (
                    <p className="text-lg text-slate-600 mb-6 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {featuredArticle.published_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(featuredArticle.published_at), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <span className="inline-flex items-center text-[#8dbf65] font-medium hover:text-[#7aad52]">
                      Read More <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Articles Grid */}
        {regularArticles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => {
              const authorName = article.author?.full_name || article.author?.email?.split('@')[0] || 'The Nugget Team';

              return (
                <Link key={article.id} href={`/article/${article.slug}`}>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                    {article.hero_image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={article.hero_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      {article.category && (
                        <span className="inline-block w-fit px-3 py-1 bg-[#8dbf65] text-white text-xs font-medium rounded-full mb-3">
                          {article.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-slate-600 mb-4 line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                        <span>{authorName}</span>
                        {article.published_at && (
                          <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-slate-600">No articles published yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
