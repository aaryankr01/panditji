import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const ImageCropperModal = ({ file, onCrop, onClose }) => {
  const [imgSrc, setImgSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, aspect: 1 });
  const [rotation, setRotation] = useState(0); // Optional: rotation support

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const CONTAINER_SIZE = 320;
  const CROP_SIZE = 240;

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const aspect = naturalWidth / naturalHeight;

    let baseWidth = CONTAINER_SIZE;
    let baseHeight = CONTAINER_SIZE;

    if (aspect > 1) {
      baseWidth = CONTAINER_SIZE * aspect;
    } else {
      baseHeight = CONTAINER_SIZE / aspect;
    }

    setImageSize({
      width: baseWidth,
      height: baseHeight,
      naturalWidth,
      naturalHeight,
      aspect,
    });
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Bounds checking to prevent dragging the image outside the crop area
    const bounds = getBounds(zoom);
    setPosition({
      x: Math.max(bounds.minX, Math.min(bounds.maxX, newX)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    const bounds = getBounds(zoom);
    setPosition({
      x: Math.max(bounds.minX, Math.min(bounds.maxX, newX)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, newY)),
    });
  };

  // Calculates the boundaries for panning so the crop area is always covered
  const getBounds = (currentZoom) => {
    if (!imageSize.width) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const renderedWidth = imageSize.width * currentZoom;
    const renderedHeight = imageSize.height * currentZoom;

    // Crop area center is (CONTAINER_SIZE/2, CONTAINER_SIZE/2)
    // Left edge of crop area is (CONTAINER_SIZE - CROP_SIZE) / 2
    const cropLeft = (CONTAINER_SIZE - CROP_SIZE) / 2;
    const cropTop = (CONTAINER_SIZE - CROP_SIZE) / 2;

    // We want: renderedLeft <= cropLeft  => (CONTAINER_SIZE/2 - renderedWidth/2 + position.x) <= cropLeft
    // position.x <= cropLeft - CONTAINER_SIZE/2 + renderedWidth/2
    const maxX = cropLeft - CONTAINER_SIZE / 2 + renderedWidth / 2;
    
    // We want: renderedRight >= cropRight => (CONTAINER_SIZE/2 + renderedWidth/2 + position.x) >= cropRight (where cropRight = CONTAINER_SIZE - cropLeft)
    // position.x >= cropRight - CONTAINER_SIZE/2 - renderedWidth/2
    const cropRight = CONTAINER_SIZE - cropLeft;
    const minX = cropRight - CONTAINER_SIZE / 2 - renderedWidth / 2;

    const maxY = cropTop - CONTAINER_SIZE / 2 + renderedHeight / 2;
    const cropBottom = CONTAINER_SIZE - cropTop;
    const minY = cropBottom - CONTAINER_SIZE / 2 - renderedHeight / 2;

    return { minX, maxX, minY, maxY };
  };

  // Adjust position when zoom changes to ensure it stays in bounds
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    const bounds = getBounds(newZoom);
    setPosition((prev) => ({
      x: Math.max(bounds.minX, Math.min(bounds.maxX, prev.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, prev.y)),
    }));
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = () => {
    if (!imageRef.current || !imageSize.width) return;

    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');

    const renderedWidth = imageSize.width * zoom;
    const renderedHeight = imageSize.height * zoom;

    const renderedX = CONTAINER_SIZE / 2 - renderedWidth / 2 + position.x;
    const renderedY = CONTAINER_SIZE / 2 - renderedHeight / 2 + position.y;

    const cropX = (CONTAINER_SIZE - CROP_SIZE) / 2;
    const cropY = (CONTAINER_SIZE - CROP_SIZE) / 2;

    const dx = cropX - renderedX;
    const dy = cropY - renderedY;

    const scaleFactor = imageSize.naturalWidth / renderedWidth;

    const sx = dx * scaleFactor;
    const sy = dy * scaleFactor;
    const sWidth = CROP_SIZE * scaleFactor;
    const sHeight = CROP_SIZE * scaleFactor;

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-CROP_SIZE / 2, -CROP_SIZE / 2);
    }

    ctx.drawImage(
      imageRef.current,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      CROP_SIZE,
      CROP_SIZE
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
        onCrop(croppedFile);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Crop Profile Picture</h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Crop Area Container */}
        <div 
          ref={containerRef}
          style={styles.cropContainer}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {imgSrc && (
            <img
              ref={imageRef}
              src={imgSrc}
              alt="To Crop"
              onLoad={handleImageLoad}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                ...styles.image,
                width: imageSize.width,
                height: imageSize.height,
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            />
          )}
          {/* Mask Overlay */}
          <div style={styles.mask}></div>
          {/* Circular Cutout Frame */}
          <div style={styles.cropFrame}></div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.sliderRow}>
            <ZoomOut size={16} color="#718096" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              style={styles.slider}
            />
            <ZoomIn size={16} color="#718096" />
          </div>

          <button onClick={rotateImage} style={styles.rotateBtn}>
            <RotateCw size={14} style={{ marginRight: 6 }} /> Rotate Image
          </button>
        </div>

        {/* Footer Actions */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={handleSave} style={styles.saveBtn}>
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #edf2f7',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a202c',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#a0aec0',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  cropContainer: {
    width: 320,
    height: 320,
    position: 'relative',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    alignSelf: 'center',
    userSelect: 'none',
    touchAction: 'none',
  },
  image: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    maxWidth: 'none',
    maxHeight: 'none',
    transformOrigin: 'center center',
    transition: 'none',
  },
  mask: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    width: 240,
    height: 240,
    margin: 'auto',
  },
  cropFrame: {
    position: 'absolute',
    width: 240,
    height: 240,
    border: '2px solid #fff',
    borderRadius: '50%',
    boxSizing: 'border-box',
    inset: 0,
    margin: 'auto',
    pointerEvents: 'none',
    boxShadow: '0 0 8px rgba(0,0,0,0.3)',
  },
  controls: {
    padding: '16px 20px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    appearance: 'none',
    background: '#e2e8f0',
    outline: 'none',
    cursor: 'pointer',
  },
  rotateBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#E8710A',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
  },
  footer: {
    display: 'flex',
    gap: 12,
    padding: '16px 20px 20px',
    borderTop: '1px solid #edf2f7',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    color: '#4a5568',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  saveBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: '#7B1D0E',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(123, 29, 14, 0.2)',
  },
};

export default ImageCropperModal;
