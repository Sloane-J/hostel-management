import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { validatePhotoFile } from "@/lib/upload";
import { Upload, X } from "lucide-react";

interface PhotoUploadProps {
  onFileSelected: (file: File | null) => void;
}

export function PhotoUpload({ onFileSelected }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validatePhotoFile(file);
    if (validationError) {
      setError(validationError);
      onFileSelected(null);
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    onFileSelected(file);
  }

  function handleClear() {
    setPreview(null);
    setError(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="flex items-center gap-3">
          <img src={preview} alt="Preview" className="h-16 w-16 border object-cover" />
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            <X className="mr-1 h-3 w-3" /> Remove
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Upload photo
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Optional — JPG, PNG, or WebP, under 5MB.</p>
    </div>
  );
}