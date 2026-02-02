'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Link as LinkIcon, Loader2, Star, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client-browser';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface RestaurantImage {
  id: string;
  image_url: string;
  is_featured: boolean;
  display_order: number;
}

interface MultiImageUploadProps {
  restaurantId: string;
  onImagesChange?: () => void;
}

export function MultiImageUpload({ restaurantId, onImagesChange }: MultiImageUploadProps) {
  const [images, setImages] = useState<RestaurantImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadImages();
  }, [restaurantId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_images')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      console.error('Error loading images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setError('File must be JPG, PNG, or WebP');
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be logged in to upload images');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('restaurant-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(uploadData.path);

      const { error: insertError } = await supabase
        .from('restaurant_images')
        .insert({
          restaurant_id: restaurantId,
          image_url: publicUrl,
          is_featured: images.length === 0,
          display_order: images.length
        });

      if (insertError) throw insertError;

      await loadImages();
      onImagesChange?.();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setError(null);
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be logged in to add images');
      }

      const { error: insertError } = await supabase
        .from('restaurant_images')
        .insert({
          restaurant_id: restaurantId,
          image_url: urlInput.trim(),
          is_featured: images.length === 0,
          display_order: images.length
        });

      if (insertError) throw insertError;

      await loadImages();
      onImagesChange?.();
      setUrlInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to add image');
    } finally {
      setUploading(false);
    }
  };

  const handleSetFeatured = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_images')
        .update({ is_featured: true })
        .eq('id', imageId);

      if (error) throw error;

      await loadImages();
      onImagesChange?.();
    } catch (err: any) {
      setError(err.message || 'Failed to set featured image');
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      if (imageUrl.includes('supabase')) {
        const path = imageUrl.split('/restaurant-images/')[1];
        if (path) {
          await supabase.storage.from('restaurant-images').remove([path]);
        }
      }

      await loadImages();
      onImagesChange?.();
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Restaurant Images</Label>
        <p className="text-sm text-gray-500 mt-1">
          Upload multiple images. The first image will be featured by default.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Use URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG or WebP (max 5MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              disabled={uploading}
            />
            <Button type="button" onClick={handleUrlSubmit} size="icon" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt="Restaurant"
                    fill
                    className="object-cover"
                  />
                  {image.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!image.is_featured && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => handleSetFeatured(image.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => handleDelete(image.id, image.image_url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
