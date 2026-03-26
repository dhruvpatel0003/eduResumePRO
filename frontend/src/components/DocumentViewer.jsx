import React, { useState, useEffect } from 'react';
import '../styles/document-viewer.css';

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 25;

const DocumentViewer = ({ previewUrl, title, numPages = 1, placeholderLabel }) => {
  const [zoom, setZoom] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    if (!previewUrl) {
      setIsPdf(false);
      return;
    }
    // Detect PDF by fetching the blob and checking its type
    const checkPdf = async () => {
      try {
        const resp = await fetch(previewUrl);
        const blob = await resp.blob();
        setIsPdf(blob.type === 'application/pdf');
      } catch {
        setIsPdf(false);
      }
    };
    checkPdf();
  }, [previewUrl]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handlePageInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      setPageNumber(val);
    }
  };

  return (
    <div className="doc-viewer">
      {/* Toolbar */}
      <div className="doc-viewer-toolbar">
        <div className="doc-viewer-zoom">
          <button
            className="doc-viewer-btn"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            &minus;
          </button>
          <span className="doc-viewer-zoom-label">{zoom}%</span>
          <button
            className="doc-viewer-btn"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        {!isPdf && (
          <div className="doc-viewer-pages">
            <input
              type="number"
              className="doc-viewer-page-input"
              value={pageNumber}
              min={1}
              max={numPages}
              onChange={handlePageInput}
              disabled={numPages <= 1}
              aria-label="Page number"
            />
            <span className="doc-viewer-page-total">of {numPages}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="doc-viewer-content">
        {previewUrl ? (
          isPdf ? (
            <iframe
              src={`${previewUrl}#page=${pageNumber}`}
              title={title || 'Document preview'}
              className="doc-viewer-pdf"
              style={{
                width: `${zoom}%`,
                height: '100%',
                border: 'none',
                minHeight: '600px',
              }}
            />
          ) : (
            <div
              className="doc-viewer-canvas"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <img
                src={previewUrl}
                alt={title || 'Document preview'}
                className="doc-viewer-image"
              />
            </div>
          )
        ) : (
          <div className="doc-viewer-canvas">
            <div className="doc-viewer-placeholder">
              <span>{title || 'Document'}</span>
              <span className="doc-viewer-placeholder-sub">
                {placeholderLabel || 'Preview'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
