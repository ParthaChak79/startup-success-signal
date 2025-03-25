
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

  useEffect(() => {
    setPageNumber(1);
    setLoading(true);
    setError(false);
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = () => {
    setError(true);
    setLoading(false);
    console.error("Failed to load PDF document:", fileUrl);
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
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
  }), []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto flex items-center justify-center relative">
        {loading && (
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
              <p className="text-sm mt-2">The PDF may be corrupted or using unsupported features.</p>
            </div>
          }
        >
          {!error && (
            <Page 
              pageNumber={pageNumber}
              width={300}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              className="pdf-page"
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
