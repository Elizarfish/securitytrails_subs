import React from 'react';
import { Studio } from '../types';

interface StudioCardProps {
  studio: Studio;
  onSelect: (studio: Studio) => void;
}

const StudioCard: React.FC<StudioCardProps> = ({ studio, onSelect }) => {
  return (
    <div className="studio-card" onClick={() => onSelect(studio)}>
      <div className="studio-image">
        {studio.images && studio.images.length > 0 ? (
          <img src={studio.images[0]} alt={studio.name} />
        ) : (
          <div className="placeholder-image">Фото студии</div>
        )}
      </div>
      <div className="studio-info">
        <h3>{studio.name}</h3>
        <p className="studio-description">{studio.description}</p>
        <p className="studio-address">📍 {studio.address}</p>
        <div className="studio-details">
          <span className="price">{studio.pricePerHour} ₽/час</span>
          <span className="capacity">👥 {studio.capacity} чел.</span>
        </div>
        <div className="amenities">
          {studio.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="amenity-tag">
              {amenity}
            </span>
          ))}
          {studio.amenities.length > 3 && (
            <span className="amenity-tag">+{studio.amenities.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioCard;