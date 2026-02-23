import React, { useState, useEffect } from 'react';
import type { Promo } from '../types/parahita';
import './PromoSlide.css';

interface PromoSlideProps {
  promos: Promo[];
}

/**
 * Carousel component for displaying promotional banners.
 * Shows promo images with navigation and auto-play functionality.
 */
export const PromoSlide: React.FC<PromoSlideProps> = ({ promos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play: advance to next slide every 5 seconds
  useEffect(() => {
    if (promos.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promos.length, isPaused]);

  if (!promos || promos.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
    setIsPaused(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promos.length);
    setIsPaused(true);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
  };

  const currentPromo = promos[currentIndex];

  return (
    <div
      className="promo-slide-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      <div className="promo-slide-wrapper">
        {promos.length > 1 && (
          <button
            className="promo-nav-button promo-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous promo"
            type="button"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}

        <div className="promo-slide-content">
          <div className="promo-image-container">
            {currentPromo.banner ? (
              <img
                src={currentPromo.banner}
                alt={currentPromo.nama_pemeriksaan || currentPromo.nama_alias}
                className="promo-image"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="promo-placeholder">
                <span className="material-symbols-outlined">image</span>
              </div>
            )}
          </div>

          <div className="promo-info">
            {currentPromo.nama_alias && (
              <h3 className="promo-title">{currentPromo.nama_alias}</h3>
            )}
            {currentPromo.nama_pemeriksaan && (
              <p className="promo-alias">{currentPromo.nama_pemeriksaan}</p>
            )}
          </div>
        </div>

        {promos.length > 1 && (
          <button
            className="promo-nav-button promo-nav-next"
            onClick={goToNext}
            aria-label="Next promo"
            type="button"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>

      {promos.length > 1 && (
        <div className="promo-indicators">
          {promos.map((_, index) => (
            <button
              key={index}
              className={`promo-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to promo ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};
