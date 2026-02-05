import { useRef } from 'react';

interface BabyAvatarPickerProps {
  avatarUrl?: string;
  babyName: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
  uploading?: boolean;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-20 h-20 text-2xl',
  lg: 'w-[120px] h-[120px] text-4xl',
};

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 400; // Max width/height in pixels
const JPEG_QUALITY = 0.8;

/**
 * Compress and resize an image using Canvas API.
 * Returns a JPEG file ~50-150KB regardless of input size.
 */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // Clean up

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not compress image'));
            return;
          }

          // Create new file with .jpg extension
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          );

          resolve(compressedFile);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    img.src = objectUrl;
  });
}

export function BabyAvatarPicker({
  avatarUrl,
  babyName,
  size = 'md',
  editable = false,
  onUpload,
  uploading = false,
}: BabyAvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = babyName ? babyName.charAt(0).toUpperCase() : '?';

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Please select a JPEG, PNG, or WebP image.');
      return;
    }

    try {
      // Compress image before upload (handles any size)
      const compressedFile = await compressImage(file);
      await onUpload(compressedFile);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={!editable || uploading}
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-2 border-[var(--bg-soft)]
          flex items-center justify-center
          overflow-hidden
          ${editable ? 'cursor-pointer hover:border-[var(--nap-color)]/50' : 'cursor-default'}
          transition-colors
          relative
        `}
        aria-label={editable ? 'Change profile picture' : `${babyName}'s avatar`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${babyName}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <span className="font-display font-bold text-[var(--nap-color)]">
              {initial}
            </span>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-[var(--bg-deep)]/70 flex items-center justify-center">
            <div className="spinner w-6 h-6 border-2 border-[var(--nap-color)]/30 border-t-[var(--nap-color)] rounded-full animate-spin" />
          </div>
        )}

        {/* Edit overlay */}
        {editable && !uploading && (
          <div className="absolute inset-0 bg-[var(--bg-deep)]/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="text-[var(--text-primary)]">
              <CameraIcon />
            </div>
          </div>
        )}
      </button>

      {/* Hidden file input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
