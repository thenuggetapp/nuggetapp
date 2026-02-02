/*
  # Create Blog Articles Table

  1. New Tables
    - `blog_articles`
      - `id` (uuid, primary key)
      - `title` (text, required) - Article title
      - `slug` (text, unique, required) - URL-friendly slug
      - `excerpt` (text) - Short description for listings
      - `content` (text, required) - Article body content (supports markdown/HTML)
      - `hero_image_url` (text) - Main article image
      - `category` (text) - Category/location tag (e.g., "Chicago")
      - `author_id` (uuid, references user_profiles) - Article author
      - `published` (boolean, default false) - Publication status
      - `published_at` (timestamptz) - Publication date
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `meta_description` (text) - SEO description
      - `featured` (boolean, default false) - Featured article flag
      
  2. Security
    - Enable RLS on `blog_articles` table
    - Public can read published articles
    - Admins and local heroes can create, update, delete articles
    - Authors can edit their own articles
    
  3. Indexes
    - Index on slug for fast lookups
    - Index on published and published_at for listing queries
    - Index on author_id for author queries
*/

-- Create blog_articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  hero_image_url text,
  category text,
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  meta_description text,
  featured boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can view published articles"
  ON blog_articles
  FOR SELECT
  USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can view all articles"
  ON blog_articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create articles"
  ON blog_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'local_hero')
    )
  );

CREATE POLICY "Admins and local heroes can update articles"
  ON blog_articles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.role IN ('admin', 'local_hero')
        OR user_profiles.id = blog_articles.author_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.role IN ('admin', 'local_hero')
        OR user_profiles.id = blog_articles.author_id
      )
    )
  );

CREATE POLICY "Admins can delete articles"
  ON blog_articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON blog_articles(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_author ON blog_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles(category);
CREATE INDEX IF NOT EXISTS idx_blog_articles_featured ON blog_articles(featured) WHERE featured = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_articles_updated_at();