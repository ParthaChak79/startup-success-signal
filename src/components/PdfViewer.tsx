
import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Configure PDF.js worker with a direct and explicit URL to ensure reliable loading
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    setPageNumber(1);
    setLoading(true);
    setError(false);
    setRetryCount(0);
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Failed to load PDF document:", fileUrl, err);
    setError(true);
    setLoading(false);
    
    // Only retry loading a limited number of times
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        setLoading(true);
        setError(false);
      }, 1000);
    }
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  // Memoize the options to prevent unnecessary rerenders
  const options = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    // Enhanced options for better PDF compatibility
    disableAutoFetch: false,
    disableStream: false,
    disableRange: false,
    isEvalSupported: true,
    maxImageSize: 1024 * 1024 * 50, // Increased max image size for scanned PDFs
    isOffscreenCanvasSupported: true,
    useSystemFonts: true
  }), []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto flex items-center justify-center relative">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Skeleton className="h-[250px] w-[180px]" />
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<Skeleton className="h-[250px] w-[180px]" />}
          options={options}
          className="max-h-full"
          error={
            <div className="text-destructive text-center p-4">
              Failed to load PDF. Please try again with a different file.
              <p className="text-sm mt-2">
                {retryCount >= 3 ? 
                  "Multiple attempts to load this PDF have failed. The file may be corrupted or using unsupported features." : 
                  "Retrying..."}
              </p>
            </div>
          }
        >
          {!error && (
            <Page 
              pageNumber={pageNumber}
              width={300}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
              error={<div className="text-destructive text-center p-2">Error loading this page</div>}
              noData={<div className="text-muted-foreground text-center p-2">No page data</div>}
              canvasBackground="transparent"
              scale={1}
            />
          )}
        </Document>
      </div>
      
      {numPages && numPages > 1 && !error && (
        <div className="flex items-center justify-between p-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={nextPage} 
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
