
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, FileImage, PresentationIcon, File, UploadIcon, Info } from 'lucide-react';
import { FileType, ProcessingStage, getProcessingStageText } from '@/utils/fileUtils';

interface DropZoneProps {
  isDragging: boolean;
  fileName: string;
  fileSize: number;
  fileType: FileType;
  isUploading: boolean;
  processingProgress: number;
  processingStage: ProcessingStage;
  ocrMode: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  isDragging,
  fileName,
  fileSize,
  fileType,
  isUploading,
  processingProgress,
  processingStage,
  ocrMode,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-16 w-16 text-primary" />;
      case 'image':
        return <FileImage className="h-16 w-16 text-primary" />;
      case 'presentation':
        return <PresentationIcon className="h-16 w-16 text-primary" />;
      case 'document':
        return <File className="h-16 w-16 text-primary" />;
      default:
        return <UploadIcon className="h-16 w-16 text-gray-400" />;
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
    onClick();
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50'}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
    >
      <div className="mb-4 text-center">
        {fileName ? (
          <>
            {getFileIcon()}
            <p className="text-xs text-muted-foreground mt-1">
              {(fileSize / 1024 / 1024).toFixed(1)} MB
            </p>
          </>
        ) : (
          <div className="flex justify-center space-x-2">
            <FileText className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <FileImage className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <PresentationIcon className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
          </div>
        )}
        
        <h3 className="text-lg font-medium text-gray-900 mt-4">
          {fileName ? fileName : 'Upload your pitch deck'}
        </h3>
        
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop or click to upload (PDF, Presentations, Images, Documents)
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx,.txt,.rtf,.gif,.bmp,.webp,.tiff,.tif"
        onChange={onFileInputChange}
      />
      
      {isUploading && (
        <div className="w-full mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{getProcessingStageText(processingStage, ocrMode)}</span>
            <span>{processingProgress}%</span>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="mt-4"
        disabled={isUploading}
      >
        {isUploading ? 'Processing...' : 'Select file'}
      </Button>
      
      {ocrMode && fileName && !isUploading && (
        <div className="mt-4 p-2 bg-blue-50 rounded-md flex items-center text-sm text-blue-800">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>OCR was used to extract text from this file.</span>
        </div>
      )}
    </div>
  );
};

export default DropZone;
