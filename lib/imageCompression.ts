import imageCompression from 'browser-image-compression'

interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
  initialQuality?: number
}

export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1080,
    useWebWorker: false, // Disabled for mobile compatibility
    fileType: 'image/webp',
    initialQuality: 0.8,
    ...options
  }

  try {
    // Primary compression attempt
    const compressedFile = await imageCompression(file, defaultOptions)
    
    // Verify compression was successful
    if (compressedFile.size > file.size) {
      console.warn('Compression increased file size, using original')
      return file
    }
    
    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    
    // Fallback: Try without WebP conversion
    try {
      const fallbackOptions = {
        ...defaultOptions,
        fileType: file.type, // Keep original format
        useWebWorker: false,
      }
      
      const fallbackCompressed = await imageCompression(file, fallbackOptions)
      return fallbackCompressed.size < file.size ? fallbackCompressed : file
    } catch (fallbackError) {
      console.error('Fallback compression failed:', fallbackError)
      return file // Return original if all compression fails
    }
  }
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please use JPEG, PNG, WebP, or HEIC images.' }
  }
  
  // Check file size (10MB limit before compression)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
    return { 
      valid: false, 
      error: `File too large (${fileSizeMB}MB). Maximum size is 10MB. Try compressing your image first.` 
    }
  }
  
  return { valid: true }
}

export const generateImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to generate image preview'))
    }
    
    reader.readAsDataURL(file)
  })
}

// Helper for batch processing multiple images
export const compressImages = async (
  files: File[], 
  options?: CompressionOptions,
  onProgress?: (current: number, total: number) => void
): Promise<File[]> => {
  const compressed: File[] = []
  
  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i], options)
      compressed.push(compressedFile)
      
      if (onProgress) {
        onProgress(i + 1, files.length)
      }
    } catch (error) {
      console.error(`Failed to compress image ${i + 1}:`, error)
      compressed.push(files[i]) // Use original on failure
    }
  }
  
  return compressed
} 