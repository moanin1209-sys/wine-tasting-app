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
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
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
            className="w-full h-48 object-cover rounded-2xl border border-white/[0.08]"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white/80 text-sm">업로드 중...</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/80 backdrop-blur-sm transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-48 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/30 hover:border-white/40 hover:text-white/50 hover:bg-white/[0.03] transition-all duration-300"
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
