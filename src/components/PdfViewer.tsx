
import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, FileImage, AlertCircle, File, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Configure PDF.js worker with a direct and explicit URL to ensure reliable loading
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'other'>('pdf');
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullPreview, setIsFullPreview] = useState<boolean>(false);

  useEffect(() => {
    setPageNumber(1);
    setLoading(true);
    setError(false);
    setRetryCount(0);
    setScale(1.0);
    setRotation(0);
    
    // Determine file type based on URL or object URL
    if (fileUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|tiff|tif)$/i) || 
        fileUrl.includes('blob:') && fileUrl.includes('image')) {
      setFileType('image');
    } else if (fileUrl.match(/\.(pdf)$/i) || 
               fileUrl.includes('blob:') && !fileUrl.includes('image')) {
      setFileType('pdf');
    } else {
      // Try to infer from content if possible
      fetch(fileUrl, { method: 'HEAD' })
        .then(response => {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('image')) {
            setFileType('image');
          } else if (contentType && contentType.includes('pdf')) {
            setFileType('pdf');
          } else {
            setFileType('other');
          }
        })
        .catch(() => {
          // If we can't determine, default to PDF and let the viewer handle errors
          setFileType('pdf');
        });
    }
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

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const toggleFullPreview = () => {
    setIsFullPreview(prev => !prev);
  };

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

  if (fileType === 'image') {
    return (
      <div className="flex flex-col h-full">
        <div className={`flex-1 overflow-auto flex items-center justify-center relative ${isFullPreview ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
          {loading && (
            <Skeleton className="h-[250px] w-[180px]" />
          )}
          <div className="relative">
            <img 
              src={fileUrl} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain"
              style={{ 
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-in-out' 
              }}
              onLoad={() => setLoading(false)}
              onError={() => setError(true)}
            />
          </div>
          
          {error && (
            <div className="text-destructive text-center p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              Failed to load image
            </div>
          )}
          
          {!error && !loading && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-background/80 p-2 rounded-md">
              <Button size="sm" variant="outline" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={rotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={toggleFullPreview}>
                {isFullPreview ? 'Exit Full View' : 'Full View'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (fileType === 'other') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <File className="h-16 w-16 mx-auto mb-2 text-gray-400" />
            <p className="text-muted-foreground">Preview not available</p>
            <p className="text-xs text-muted-foreground">This file type cannot be previewed</p>
          </div>
        </div>
      </div>
    );
  }

  // Full screen modal for expanded PDF viewing
  if (isFullPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-4 overflow-auto flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Pitch Deck Preview</h3>
          <Button variant="outline" size="sm" onClick={toggleFullPreview}>
            Close Preview
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="flex justify-center p-8"><Skeleton className="h-[400px] w-[300px]" /></div>}
            options={options}
            className="flex flex-col items-center"
            error={
              <Card className="p-4 max-w-md mx-auto">
                <div className="text-destructive text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Failed to load PDF</p>
                  <p className="text-sm mt-2">
                    {retryCount >= 3 ? 
                      "Multiple attempts to load this PDF have failed." : 
                      "Retrying..."}
                  </p>
                </div>
              </Card>
            }
          >
            {!error && numPages && (
              <>
                {Array.from(new Array(numPages), (_, index) => (
                  <div key={`page_${index + 1}`} className="mb-8">
                    <Page 
                      pageNumber={index + 1}
                      width={600}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="pdf-page border shadow-md"
                      scale={scale}
                      rotate={rotation}
                      error={<div className="text-destructive text-center p-2">Error loading page {index + 1}</div>}
                      noData={<div className="text-muted-foreground text-center p-2">No data for page {index + 1}</div>}
                      canvasBackground="white"
                    />
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      Page {index + 1} of {numPages}
                    </p>
                  </div>
                ))}
              </>
            )}
          </Document>
        </div>
        
        <div className="mt-4 flex justify-center gap-2">
          <Button size="sm" variant="outline" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
          </Button>
          <Button size="sm" variant="outline" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
          </Button>
          <Button size="sm" variant="outline" onClick={rotate}>
            <RotateCw className="h-4 w-4 mr-1" /> Rotate
          </Button>
        </div>
      </div>
    );
  }

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
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              Failed to load PDF
              <p className="text-sm mt-2">
                {retryCount >= 3 ? 
                  "Multiple attempts to load this PDF have failed." : 
                  "Retrying..."}
              </p>
            </div>
          }
        >
          {!error && (
            <div style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transition: 'transform 0.2s ease-in-out' }}>
              <Page 
                pageNumber={pageNumber}
                width={300}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="pdf-page"
                error={<div className="text-destructive text-center p-2">Error loading this page</div>}
                noData={<div className="text-muted-foreground text-center p-2">No page data</div>}
                canvasBackground="transparent"
              />
            </div>
          )}
        </Document>
        
        {!error && !loading && numPages && numPages > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
            onClick={toggleFullPreview}
          >
            View Full Deck
          </Button>
        )}
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
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={zoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={zoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={rotate} title="Rotate">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          
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
