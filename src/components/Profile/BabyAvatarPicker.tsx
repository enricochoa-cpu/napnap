import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const UPLOAD_TIMEOUT_MS = 30_000;

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

const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={className ? undefined : 20}
    height={className ? undefined : 20}
    style={className ? { width: '100%', height: '100%' } : undefined}
  >
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
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      setUploadError(null);
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Please select a JPEG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }

    setUploadError(null);
    try {
      const compressedFile = await compressImage(file);
      const uploadPromise = onUpload(compressedFile);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Upload timed out')), UPLOAD_TIMEOUT_MS);
      });
      await Promise.race([uploadPromise, timeoutPromise]);
    } catch (error) {
      const message = error instanceof Error && error.message === 'Upload timed out'
        ? 'Upload took too long. Check your connection and try again.'
        : 'Failed to upload image. Please try again.';
      setUploadError(message);
      console.error('Upload failed:', error);
    }

    e.target.value = '';
  };

  // When not editable, use a div so the avatar doesn't capture clicks (e.g. card is the tap target).
  const avatarClassName = `
    ${sizeClasses[size]}
    rounded-full
    border-2 border-[var(--bg-soft)]
    flex items-center justify-center
    overflow-hidden
    ${editable ? 'cursor-pointer hover:border-[var(--nap-color)]/50' : 'cursor-default'}
    transition-colors
    relative
  `;

  const avatarContent = (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${babyName}'s avatar`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[var(--nap-color)]/20 flex items-center justify-center text-[var(--nap-color)]">
          <span
            className={`inline-block flex-shrink-0 ${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'}`}
            aria-hidden="true"
          >
            <CameraIcon className="w-full h-full" />
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
    </>
  );

  return (
    <div className="relative inline-block">
      {editable ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className={avatarClassName}
          aria-label={t('common.ariaChangePhoto')}
          aria-describedby={uploadError ? 'avatar-upload-error' : undefined}
        >
          {avatarContent}
        </button>
      ) : (
        <div className={avatarClassName} role="img" aria-label={`${babyName}'s avatar`}>
          {avatarContent}
        </div>
      )}

      {/* Error message and retry when upload fails or times out */}
      {editable && uploadError && (
        <div id="avatar-upload-error" className="mt-2 text-center">
          <p className="text-xs text-[var(--danger-color)] mb-1">{uploadError}</p>
          <button
            type="button"
            onClick={handleClick}
            className="text-xs font-display font-semibold text-[var(--nap-color)] hover:underline"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      )}

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
