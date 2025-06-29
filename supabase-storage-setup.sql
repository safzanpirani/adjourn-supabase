-- Create the photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Enable RLS for storage objects
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Remove any existing problematic triggers
DROP TRIGGER IF EXISTS cleanup_photo_storage_trigger ON photos;
DROP FUNCTION IF EXISTS cleanup_photo_storage();

-- Note: Storage cleanup is handled in the client code, not via database triggers
-- This prevents function conflicts and gives better error handling 