'use client';

import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append('file', compressed, compressed.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('업로드 실패');

      const { url } = await res.json();
      onChange(url);
    } catch {
      alert('사진 업로드에 실패했습니다. 다시 시도해주세요.');
      setPreview(value);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="와인 사진"
            className="w-full h-48 object-cover rounded-2xl border border-[var(--border)]"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center">
              <span className="text-white/70 text-sm">업로드 중...</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2.5 right-2.5 bg-black/60 text-white/70 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/80 transition-colors duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-48 border border-dashed border-[--border] rounded-2xl flex flex-col items-center justify-center text-[--text-placeholder] hover:border-[--text-muted] hover:text-[--text-muted] hover:bg-[--surface-secondary] transition-all duration-500"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <span className="text-3xl mb-2">📷</span>
          <span className="text-sm">사진 추가</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
