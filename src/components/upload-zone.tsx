'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'

interface UploadZoneProps {
    onImageSelect: (file: File) => void
    selectedImage: File | null
    onClear: () => void
}

export function UploadZone({ onImageSelect, selectedImage, onClear }: UploadZoneProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [compressing, setCompressing] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            try {
                setCompressing(true)
                // Compression options
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                }

                const compressedFile = await imageCompression(file, options)

                // Create preview
                const objectUrl = URL.createObjectURL(compressedFile)
                setPreview(objectUrl)
                onImageSelect(compressedFile)
                toast.success(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
            } catch (error) {
                console.error(error)
                toast.error("Failed to compress image")
                // Fallback to original file if compression fails
                const objectUrl = URL.createObjectURL(file)
                setPreview(objectUrl)
                onImageSelect(file)
            } finally {
                setCompressing(false)
            }
        }
    }, [onImageSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    })

    const handleClear = () => {
        if (preview) {
            URL.revokeObjectURL(preview)
            setPreview(null)
        }
        onClear()
    }

    return (
        <div className="w-full">
            {selectedImage && preview ? (
                <div className="relative rounded-lg border overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-contain bg-gray-100"
                    />
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs truncate">
                        {selectedImage.name}
                    </div>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors h-64 flex flex-col items-center justify-center",
                        isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    )}
                >
                    <input {...getInputProps()} />
                    {compressing ? (
                        <div className="flex flex-col items-center gap-4 text-gray-500">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="font-medium">Optimizing image...</p>
                        </div>
                    ) : isDragActive ? (
                        <div className="flex flex-col items-center gap-4 text-primary">
                            <Upload className="w-10 h-10" />
                            <p className="font-medium">Drop screenshot here</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                                <p className="text-sm mt-1">PNG, JPG, WebP (max 5MB)</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
