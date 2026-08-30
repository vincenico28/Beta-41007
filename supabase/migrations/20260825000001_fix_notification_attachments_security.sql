-- Fix Security Warning: Public Bucket Allows Listing on notification_attachments
-- Public buckets do not need a SELECT policy on storage.objects for users to view/download files via getPublicUrl.
-- Dropping the broad SELECT policy prevents anonymous or untrusted clients from listing all files in the bucket.

DROP POLICY IF EXISTS "Public Read Notification Attachments" ON storage.objects;
