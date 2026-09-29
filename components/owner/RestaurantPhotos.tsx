'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';

const BUCKET = 'restaurant-photos';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface Photo {
  id: string;
  image_url: string;
}

export default function RestaurantPhotos({ restaurantId }: { restaurantId: string }) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [restaurantId]);

  useEffect(() => {
    if (window.location.hash === '#photos') {
      document.getElementById('photos')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadPhotos = async () => {
    const { data, error } = await supabase
      .from('restaurant_gallery')
      .select('id, image_url')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error loading photos:', error);
      return;
    }
    setPhotos(data || []);
    if ((data || []).length > 0) setConsent(true);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let uploaded = 0;

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Some browsers report an empty type for iPhone HEIC photos
      const contentType = file.type || (ext === 'heic' || ext === 'heif' ? `image/${ext}` : '');
      if (!contentType.startsWith('image/')) {
        toast({ title: `Skipped ${file.name}`, description: 'That file isn\'t a photo', variant: 'destructive' });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: `Skipped ${file.name}`, description: 'Photos must be under 10MB', variant: 'destructive' });
        continue;
      }

      const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType });
      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        toast({ title: `Couldn't upload ${file.name}`, description: uploadError.message, variant: 'destructive' });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: insertError } = await supabase.from('restaurant_gallery').insert({
        restaurant_id: restaurantId,
        image_url: publicUrl,
        display_order: photos.length + uploaded,
        social_media_consent: true,
      });
      if (insertError) {
        console.error('Photo save error:', insertError);
        await supabase.storage.from(BUCKET).remove([path]);
        toast({ title: `Couldn't save ${file.name}`, description: insertError.message, variant: 'destructive' });
        continue;
      }
      uploaded++;
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    if (uploaded > 0) {
      toast({ title: uploaded === 1 ? 'Photo added' : `${uploaded} photos added` });
      loadPhotos();
    }
  };

  const deletePhoto = async (photo: Photo) => {
    const { error } = await supabase.from('restaurant_gallery').delete().eq('id', photo.id);
    if (error) {
      toast({ title: 'Error', description: "Couldn't remove photo", variant: 'destructive' });
      return;
    }
    const marker = `/${BUCKET}/`;
    const idx = photo.image_url.indexOf(marker);
    if (idx !== -1) {
      await supabase.storage.from(BUCKET).remove([photo.image_url.slice(idx + marker.length)]);
    }
    setPhotos((p) => p.filter((x) => x.id !== photo.id));
  };

  return (
    <Card id="photos">
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          Show families your space, your food and your team. We'll feature them on your Nugget page and on Nugget's social media.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => deletePhoto(photo)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 text-red-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
          <Checkbox id="photo_consent" checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
          <Label htmlFor="photo_consent" className="text-sm font-normal text-slate-700 cursor-pointer leading-relaxed">
            I own these photos (or have permission to share them), and Nugget can use them on my restaurant page and on Nugget's social media.
          </Label>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed border-2"
          disabled={!consent || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-5 w-5" />
              {consent ? 'Upload photos' : 'Tick the box above to upload photos'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
