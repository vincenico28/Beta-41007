-- Add attachment_url and attachment_name to public.notifications
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_name text;

COMMENT ON COLUMN public.notifications.attachment_url IS 'Public or download URL of file attached to the notification';
COMMENT ON COLUMN public.notifications.attachment_name IS 'Original file name of the attachment';

-- Create notification_attachments storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notification_attachments', 'notification_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for notification_attachments
-- Note: Public buckets do NOT need a SELECT policy on storage.objects for getPublicUrl access.
-- Omitting SELECT prevents clients from enumerating/listing all bucket contents.
DROP POLICY IF EXISTS "Public Read Notification Attachments" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated Upload Notification Attachments" ON storage.objects;
CREATE POLICY "Authenticated Upload Notification Attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notification_attachments');

DROP POLICY IF EXISTS "Authenticated Delete Notification Attachments" ON storage.objects;
CREATE POLICY "Authenticated Delete Notification Attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'notification_attachments');
