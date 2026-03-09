import React, { useRef, useCallback } from 'react';
import './ImageUploadButton.css';

interface ImageUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * Image upload button component with hidden file input.
 * Triggers file selection and calls onFileSelect callback.
 */
export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onFileSelect,
  disabled = false,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = useCallback(() => {
    if (!disabled && !isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isLoading]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          alert('Format file tidak didukung. Silakan pilih file JPG atau PNG.');
          return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert('Ukuran file terlalu besar. Maksimal 10MB.');
          return;
        }

        onFileSelect(file);
        
        // Reset input to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onFileSelect]
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Upload X-ray image"
      />
      <button
        type="button"
        className={`image-upload-button ${isLoading ? 'loading' : ''}`}
        onClick={handleButtonClick}
        disabled={disabled || isLoading}
        aria-label="Upload X-ray image"
        title="Unggah gambar X-ray"
      >
        <span className="material-symbols-outlined">
          {isLoading ? 'hourglass_empty' : 'add_photo_alternate'}
        </span>
      </button>
    </>
  );
};
