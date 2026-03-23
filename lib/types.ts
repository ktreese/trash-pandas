export interface MediaItem {
  id: string;
  blob_url: string;
  blob_pathname: string;
  content_type: string;
  caption: string | null;
  uploader_name: string | null;
  created_at: string;
  size: number | null;
}
