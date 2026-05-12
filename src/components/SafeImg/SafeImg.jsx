import React, { useState, useRef, useEffect } from 'react';

const SafeImg = ({ 
  src, 
  alt, 
  className = '', 
  fallback = '/images/placeholder.jpg',
  onLoad,
  onError,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = (e) => {
    console.warn('Image failed to load:', src, e);
    
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
      
      // Try alternative image paths for cross-device compatibility
      const alternativePaths = [
        src?.replace(/^\/images\//, '/public/images/'),
        src?.replace(/^\/public\/images\//, '/images/'),
        src?.replace(/^\/uploads\//, '/uploads/'),
        `https://om-backend-q11a.onrender.com${src}`,
        `https://om-backend-q11a.onrender.com/uploads${src}`,
        `https://om-backend-q11a.onrender.com/images${src}`,
      ];
      
      let pathIndex = 0;
      const tryNextPath = () => {
        if (pathIndex < alternativePaths.length) {
          const nextSrc = alternativePaths[pathIndex];
          console.log('Trying alternative path:', nextSrc);
          setImgSrc(nextSrc);
          pathIndex++;
        }
      };
      
      // Try first alternative immediately
      tryNextPath();
      
      // Set up retry mechanism
      imgRef.current.onerror = () => {
        if (pathIndex < alternativePaths.length) {
          tryNextPath();
        } else {
          console.error('All image paths failed for:', src);
          if (onError) onError(e);
        }
      };
    }
  };

  const handleLoad = (e) => {
    console.log('Image loaded successfully:', imgSrc);
    if (onLoad) onLoad(e);
  };

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      decoding="async"
      {...props}
      style={{
        ...props.style,
        objectFit: 'cover',
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default SafeImg;
