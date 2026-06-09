-- Run this in Supabase SQL Editor AFTER schema.sql

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('xpora-images', 'xpora-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'xpora-images' AND auth.role() = 'authenticated');

-- Allow public read
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'xpora-images');

-- Allow users to update/delete own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'xpora-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'xpora-images' AND auth.uid()::text = (storage.foldername(name))[1]);
