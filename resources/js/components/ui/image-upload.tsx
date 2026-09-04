import { Camera, X } from 'lucide-react';
import * as React from 'react';

interface ImageUploadProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Current image URL to display (e.g. stored `image_path`) */
    previewUrl?: string | null;
    /** Called when the user selects a new file or clears the selection */
    onFileChange: (file: File | null) => void;
    /** Maximum allowed file size in KB — default 2 MB */
    maxFileSizeKb?: number;
    /** Accepted MIME types — defaults to common image formats */
    accept?: string;
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp';
const DEFAULT_MAX_KB = 2048; // 2 MB

export function ImageUpload({
    previewUrl,
    onFileChange,
    maxFileSizeKb = DEFAULT_MAX_KB,
    accept = ACCEPTED_TYPES,
    className,
    ...props
}: ImageUploadProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [preview, setPreview] = React.useState<string | null>(previewUrl ?? null);
    const [error, setError] = React.useState<string | null>(null);
    const objectUrlRef = React.useRef<string | null>(null);

    // Keep preview in sync when the prop changes (e.g. after a failed submit).
    React.useEffect(() => {
        if (!previewUrl) {
            setPreview(null);
        } else {
            setPreview(previewUrl);
        }
    }, [previewUrl]);

    // Cleanup object URL on unmount to prevent memory leaks.
    React.useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    const validateFile = React.useCallback(
        (file: File): string | null => {
            // Validate MIME type against the accepted types.
            const allowedTypes = accept.split(',').map((t) => t.trim());
            if (!allowedTypes.includes(file.type)) {
                return `Invalid file type. Accepted: ${accept.replace(/,/g, ', ')}`;
            }

            // Validate file size against the max limit.
            const maxBytes = maxFileSizeKb * 1024;
            if (file.size > maxBytes) {
                const sizeMB = (maxFileSizeKb / 1024).toFixed(1);
                return `File is too large. Maximum size is ${
                    maxFileSizeKb >= 1024 ? `${sizeMB} MB` : `${maxFileSizeKb} KB`
                }.`;
            }

            return null;
        },
        [accept, maxFileSizeKb],
    );

    const handleFile = React.useCallback(
        (file: File | null) => {
            // Clear any previous error.
            setError(null);

            if (file) {
                const validationError = validateFile(file);
                if (validationError) {
                    setError(validationError);
                    // Reset the input so the same file can be re-selected.
                    if (inputRef.current) inputRef.current.value = '';
                    return;
                }

                // Revoke previous object URL to prevent memory leak.
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                }

                // Use object URL for preview instead of FileReader (better performance).
                const url = URL.createObjectURL(file);
                objectUrlRef.current = url;
                setPreview(url);
                onFileChange(file);
            } else {
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = null;
                }
                setPreview(null);
                onFileChange(null);
            }
        },
        [validateFile, onFileChange],
    );

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] ?? null;
            if (!file) return;
            handleFile(file);
        },
        [handleFile],
    );

    const handleDrop = React.useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0] ?? null;
            if (!file) return;
            handleFile(file);
        },
        [handleFile],
    );

    const handleDragOver = React.useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
        },
        [],
    );

    const handleClear = React.useCallback(() => {
        if (inputRef.current) inputRef.current.value = '';
        handleFile(null);
    }, [handleFile]);

    return (
        <div className={className} {...props}>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => inputRef.current?.click()}
                className={`relative flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/60 ${
                    error
                        ? 'border-destructive'
                        : 'border-input'
                }`}
            >
                {preview ? (
                    <div className="relative size-full">
                        <img
                            src={preview}
                            alt="Preview"
                            className="size-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="absolute right-2 top-2 rounded-full bg-background/80 p-1 transition-colors hover:bg-destructive hover:text-white"
                            aria-label="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Camera size={32} strokeWidth={1.5} />
                        <span className="text-sm">
                            Click or drag an image here
                        </span>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="sr-only"
                />
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
