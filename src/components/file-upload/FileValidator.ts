
import * as pdfjsLib from 'pdfjs-dist';
import { toast as sonnerToast } from "sonner";
import { FileType } from '@/utils/fileUtils';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

/**
 * Validates content of a file to ensure it can be processed properly
 */
export const validateFileContent = async (file: File, fileType: FileType, setOcrMode: (value: boolean) => void): Promise<{ valid: boolean; reason?: string }> => {
  if (file.size === 0) {
    return { valid: false, reason: "The file is empty (0 bytes)" };
  }
  
  if (file.size > 20 * 1024 * 1024) {
    return { valid: false, reason: "File size exceeds the 20MB limit" };
  }
  
  try {
    if (fileType === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const dataView = new DataView(arrayBuffer);
        const header = String.fromCharCode(dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2), dataView.getUint8(3));
        
        if (header !== '%PDF') {
          return { valid: false, reason: "This file doesn't appear to be a valid PDF. It might be corrupted or improperly exported." };
        }
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        if (pdf.numPages === 0) {
          return { valid: false, reason: "This PDF doesn't contain any pages" };
        }
        
        let hasContent = false;
        
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          if (textContent.items.length > 0) {
            hasContent = true;
            break;
          }
        }
        
        if (!hasContent) {
          setOcrMode(true);
          sonnerToast.info("This PDF appears to contain scanned content", {
            description: "We'll try to extract text using OCR technology"
          });
          return { valid: true };
        }
        
        return { valid: true };
      } catch (error) {
        console.error('PDF validation error:', error);
        return { 
          valid: false, 
          reason: "This PDF appears to be corrupted or improperly exported. Please check if it was correctly saved or exported from the design tool." 
        };
      }
    } else if (fileType === 'image') {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          if (img.width === 0 || img.height === 0) {
            resolve({ valid: false, reason: "This image has invalid dimensions" });
          } else {
            setOcrMode(true);
            sonnerToast.info("This image requires OCR processing", {
              description: "We'll extract text using OCR technology"
            });
            resolve({ valid: true });
          }
        };
        img.onerror = () => {
          resolve({ valid: false, reason: "Failed to load this image. It may be corrupted." });
        };
        img.src = URL.createObjectURL(file);
      });
    } else if (fileType === 'presentation' || fileType === 'document') {
      setOcrMode(true);
      sonnerToast.info(`This ${fileType === 'presentation' ? 'presentation' : 'document'} will be processed using OCR`, {
        description: "For best results, consider converting to PDF first"
      });
      return { valid: true };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('File validation error:', error);
    return { 
      valid: false, 
      reason: "Could not properly validate this file. It might be corrupted or in an unsupported format." 
    };
  }
};
