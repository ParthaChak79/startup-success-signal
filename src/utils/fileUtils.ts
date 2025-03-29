
export type FileType = 'pdf' | 'image' | 'document' | 'presentation' | 'unknown';
export type ProcessingStage = 'idle' | 'validating' | 'extracting' | 'analyzing' | 'error' | 'complete';

/**
 * Determines the file type based on extension and mime type
 */
export const determineFileType = (file: File): FileType => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();
  
  if (mimeType.includes('pdf') || fileExtension === 'pdf') {
    return 'pdf';
  } else if (
    mimeType.includes('image') || 
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].includes(fileExtension)
  ) {
    return 'image';
  } else if (
    mimeType.includes('presentation') ||
    ['ppt', 'pptx', 'key'].includes(fileExtension)
  ) {
    return 'presentation';
  } else if (
    mimeType.includes('word') || 
    mimeType.includes('opendocument') || 
    mimeType.includes('text/plain') ||
    ['doc', 'docx', 'odt', 'txt', 'rtf'].includes(fileExtension)
  ) {
    return 'document';
  }
  
  return 'unknown';
};

/**
 * Gets the appropriate icon for a file type
 */
export const getFileTypeInfo = (fileType: FileType) => {
  switch (fileType) {
    case 'pdf':
      return { label: 'PDF Document', icon: 'FileText' };
    case 'image':
      return { label: 'Image File', icon: 'FileImage' };
    case 'presentation':
      return { label: 'Presentation', icon: 'PresentationIcon' };
    case 'document':
      return { label: 'Document', icon: 'File' };
    default:
      return { label: 'File', icon: 'UploadIcon' };
  }
};

/**
 * Gets the text for the current processing stage
 */
export const getProcessingStageText = (stage: ProcessingStage, ocrMode: boolean): string => {
  switch (stage) {
    case 'validating':
      return 'Validating file...';
    case 'extracting':
      return ocrMode ? 'Performing OCR on file...' : 'Extracting text...';
    case 'analyzing':
      return 'Analyzing content with Claude...';
    default:
      return 'Processing...';
  }
};
