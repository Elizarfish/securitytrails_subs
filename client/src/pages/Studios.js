import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Clock, Star } from 'lucide-react';
import { studiosAPI } from '../services/api';
import { toast } from 'react-toastify';

const Studios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    try {
      const response = await studiosAPI.getAll();
      setStudios(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки студий');
      console.error('Error fetching studios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={headerStyle}>
          <h1 style={titleStyle}>Фотостудии</h1>
          <p style={subtitleStyle}>
            Выберите идеальную студию для вашей съемки
          </p>
        </div>

        <div className="grid grid-cols-1" style={gridStyle}>
          {studios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>

        {studios.length === 0 && (
          <div style={emptyStateStyle}>
            <h3>Студии не найдены</h3>
            <p>В данный момент нет доступных студий для бронирования.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StudioCard = ({ studio }) => {
  return (
    <div className="card" style={cardStyle}>
      <div style={cardContentStyle}>
        <div style={imageContainerStyle}>
          <img
            src={studio.image_url || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop'}
            alt={studio.name}
            style={imageStyle}
          />
        </div>
        
        <div style={contentStyle}>
          <div style={headerContentStyle}>
            <h3 style={studioNameStyle}>{studio.name}</h3>
            <div style={priceStyle}>
              {studio.price_per_hour.toLocaleString('ru-RU')} ₽/час
            </div>
          </div>
          
          <p style={descriptionStyle}>{studio.description}</p>
          
          <div style={infoGridStyle}>
            <div style={infoItemStyle}>
              <MapPin size={16} style={iconStyle} />
              <span>{studio.address}</span>
            </div>
            
            <div style={infoItemStyle}>
              <Users size={16} style={iconStyle} />
              <span>До {studio.capacity} человек</span>
            </div>
          </div>
          
          {studio.amenities && studio.amenities.length > 0 && (
            <div style={amenitiesStyle}>
              <h4 style={amenitiesTitleStyle}>Удобства:</h4>
              <div style={amenitiesListStyle}>
                {studio.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} style={amenityTagStyle}>
                    {amenity}
                  </span>
                ))}
                {studio.amenities.length > 3 && (
                  <span style={amenityTagStyle}>
                    +{studio.amenities.length - 3} еще
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div style={actionsStyle}>
            <Link
              to={`/studios/${studio.id}`}
              className="btn btn-secondary"
              style={viewButtonStyle}
            >
              Подробнее
            </Link>
            <Link
              to={`/booking/${studio.id}`}
              className="btn btn-primary"
            >
              <Clock size={16} />
              Забронировать
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Стили
const containerStyle = {
  padding: '40px 0',
  minHeight: 'calc(100vh - 80px)'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '48px'
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  marginBottom: '16px',
  color: '#1e293b'
};

const subtitleStyle = {
  fontSize: '1.25rem',
  color: '#64748b'
};

const gridStyle = {
  gap: '32px'
};

const cardStyle = {
  overflow: 'hidden',
  transition: 'all 0.3s ease'
};

const cardContentStyle = {
  display: 'grid',
  gridTemplateColumns: '300px 1fr',
  gap: '24px',
  alignItems: 'start'
};

const imageContainerStyle = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '8px'
};

const imageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  transition: 'transform 0.3s ease'
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const headerContentStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  gap: '16px'
};

const studioNameStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#1e293b',
  margin: 0
};

const priceStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: '#667eea',
  whiteSpace: 'nowrap'
};

const descriptionStyle = {
  color: '#64748b',
  lineHeight: '1.6',
  margin: 0
};

const infoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px'
};

const infoItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.9rem',
  color: '#64748b'
};

const iconStyle = {
  color: '#667eea'
};

const amenitiesStyle = {
  marginTop: '8px'
};

const amenitiesTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px'
};

const amenitiesListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px'
};

const amenityTagStyle = {
  background: '#f1f5f9',
  color: '#475569',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '0.8rem',
  fontWeight: '500'
};

const actionsStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: 'auto',
  paddingTop: '8px'
};

const viewButtonStyle = {
  flex: '0 0 auto'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#64748b'
};

export default Studios;