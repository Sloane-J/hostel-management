import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSignedPhotoUrl(bucket: string, path: string | null, expiresIn = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error(`Failed to sign URL for ${bucket}/${path}:`, error.message);
          setUrl(null);
        } else {
          setUrl(data.signedUrl);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bucket, path, expiresIn]);

  return { url, loading };
}