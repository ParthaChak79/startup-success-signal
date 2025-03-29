
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { ProcessingStage } from '@/utils/fileUtils';
import { toast as sonnerToast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

/**
 * Extracts text from PDF documents using pdfjsLib and OCR if needed
 */
export const extractTextFromPDF = async (
  file: File, 
  setProcessingStage: (stage: ProcessingStage) => void,
  setProcessingProgress: (progress: number) => void
): Promise<{ text: string; isOcr: boolean }> => {
  try {
    setProcessingStage('extracting');
    setProcessingProgress(15);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    let textExtracted = false;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      if (pageText.trim().length > 0) {
        textExtracted = true;
        fullText += pageText + ' ';
      }
      
      setProcessingProgress(15 + Math.floor((i / pdf.numPages) * 25));
    }
    
    if (textExtracted && fullText.trim().length > 50) {
      console.log("PDF text extracted successfully without OCR");
      return { text: fullText, isOcr: false };
    }
    
    console.log("PDF text extraction yielded insufficient text, falling back to OCR");
    sonnerToast.info("Using OCR to extract text from PDF", {
      description: "This might take a moment"
    });
    
    let ocrText = '';
    const scale = 1.5;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (!context) continue;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const { data } = await Tesseract.recognize(
          canvas.toDataURL('image/png'),
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                const pageProgress = (i - 1) / pdf.numPages * 25;
                setProcessingProgress(40 + pageProgress + (m.progress * 25 / pdf.numPages));
              }
            }
          }
        );
        
        ocrText += data.text + ' ';
        setProcessingProgress(40 + (i / pdf.numPages * 25));
      } catch (err) {
        console.warn(`OCR failed for page ${i}:`, err);
        continue;
      }
    }
    
    return { text: ocrText, isOcr: true };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Error processing PDF file: ' + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Extracts text from images using Tesseract OCR
 */
export const extractTextFromImage = async (
  file: File,
  setProcessingStage: (stage: ProcessingStage) => void,
  setProcessingProgress: (progress: number) => void
): Promise<string> => {
  try {
    setProcessingStage('extracting');
    setProcessingProgress(20);
    sonnerToast.info("Processing image with OCR", {
      description: "This may take a moment"
    });
    
    const preprocessImage = async (imageFile: File): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(URL.createObjectURL(imageFile));
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = 'white';
          ctx.globalAlpha = 0.1;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1.0;
          
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          resolve(URL.createObjectURL(imageFile));
        };
        
        img.src = URL.createObjectURL(imageFile);
      });
    };
    
    const processedImageUrl = await preprocessImage(file);
    
    const { data } = await Tesseract.recognize(
      processedImageUrl,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProcessingProgress(25 + Math.floor(m.progress * 25));
          }
        }
      }
    );
    
    if (data.text.trim().length < 50) {
      sonnerToast.warning("Limited text detected in the image", {
        description: "The analysis may not be accurate"
      });
    }
    
    return data.text;
  } catch (error) {
    console.error('Error performing OCR on image:', error);
    throw new Error('Error processing image file: ' + (error instanceof Error ? error.message : String(error)));
  }
};
