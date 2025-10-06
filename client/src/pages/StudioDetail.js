import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Clock, Star, Calendar, ArrowLeft } from 'lucide-react';
import { studiosAPI } from '../services/api';
import { toast } from 'react-toastify';

const StudioDetail = () => {
  const { id } = useParams();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudio();
  }, [id]);

  const fetchStudio = async () => {
    try {
      const response = await studiosAPI.getById(id);
      setStudio(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки студии');
      console.error('Error fetching studio:', error);
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

  if (!studio) {
    return (
      <div style={containerStyle}>
        <div className="container">
          <div style={errorStyle}>
            <h2>Студия не найдена</h2>
            <p>Возможно, студия была удалена или перемещена.</p>
            <Link to="/studios" className="btn btn-primary">
              <ArrowLeft size={16} />
              Вернуться к списку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="container">
        {/* Навигация назад */}
        <div style={breadcrumbStyle}>
          <Link to="/studios" style={backLinkStyle}>
            <ArrowLeft size={16} />
            Назад к студиям
          </Link>
        </div>

        {/* Заголовок */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>{studio.name}</h1>
            <div style={locationStyle}>
              <MapPin size={20} />
              <span>{studio.address}</span>
            </div>
          </div>
          <div style={priceContainerStyle}>
            <div style={priceStyle}>
              {studio.price_per_hour.toLocaleString('ru-RU')} ₽
            </div>
            <div style={priceSubStyle}>за час</div>
          </div>
        </div>

        {/* Основной контент */}
        <div style={mainContentStyle}>
          {/* Изображение */}
          <div style={imageContainerStyle}>
            <img
              src={studio.image_url || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop'}
              alt={studio.name}
              style={imageStyle}
            />
          </div>

          {/* Информация */}
          <div style={infoSectionStyle}>
            <div className="card" style={infoCardStyle}>
              <h3 style={sectionTitleStyle}>Описание</h3>
              <p style={descriptionStyle}>{studio.description}</p>

              <div style={detailsGridStyle}>
                <div style={detailItemStyle}>
                  <Users size={20} style={iconStyle} />
                  <div>
                    <div style={detailLabelStyle}>Вместимость</div>
                    <div style={detailValueStyle}>До {studio.capacity} человек</div>
                  </div>
                </div>

                <div style={detailItemStyle}>
                  <Clock size={20} style={iconStyle} />
                  <div>
                    <div style={detailLabelStyle}>Режим работы</div>
                    <div style={detailValueStyle}>9:00 - 21:00</div>
                  </div>
                </div>
              </div>

              {studio.amenities && studio.amenities.length > 0 && (
                <div style={amenitiesContainerStyle}>
                  <h4 style={amenitiesTitleStyle}>Удобства и оборудование</h4>
                  <div style={amenitiesGridStyle}>
                    {studio.amenities.map((amenity, index) => (
                      <div key={index} style={amenityItemStyle}>
                        <Star size={16} style={amenityIconStyle} />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={bookingActionStyle}>
                <Link
                  to={`/booking/${studio.id}`}
                  className="btn btn-primary"
                  style={bookingButtonStyle}
                >
                  <Calendar size={20} />
                  Забронировать студию
                </Link>
              </div>
            </div>
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

const breadcrumbStyle = {
  marginBottom: '24px'
};

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: '#667eea',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '500'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  marginBottom: '32px',
  gap: '24px'
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '12px'
};

const locationStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#64748b',
  fontSize: '1.1rem'
};

const priceContainerStyle = {
  textAlign: 'right'
};

const priceStyle = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#667eea'
};

const priceSubStyle = {
  color: '#64748b',
  fontSize: '0.9rem'
};

const mainContentStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '32px',
  alignItems: 'start'
};

const imageContainerStyle = {
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
};

const imageStyle = {
  width: '100%',
  height: '400px',
  objectFit: 'cover'
};

const infoSectionStyle = {
  position: 'sticky',
  top: '24px'
};

const infoCardStyle = {
  padding: '32px'
};

const sectionTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '16px'
};

const descriptionStyle = {
  color: '#64748b',
  lineHeight: '1.7',
  marginBottom: '24px'
};

const detailsGridStyle = {
  display: 'grid',
  gap: '16px',
  marginBottom: '24px'
};

const detailItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const iconStyle = {
  color: '#667eea'
};

const detailLabelStyle = {
  fontSize: '0.9rem',
  color: '#64748b',
  fontWeight: '500'
};

const detailValueStyle = {
  fontSize: '1rem',
  color: '#1e293b',
  fontWeight: '600'
};

const amenitiesContainerStyle = {
  marginBottom: '32px'
};

const amenitiesTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '16px'
};

const amenitiesGridStyle = {
  display: 'grid',
  gap: '8px'
};

const amenityItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#374151'
};

const amenityIconStyle = {
  color: '#10b981',
  flexShrink: 0
};

const bookingActionStyle = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '24px'
};

const bookingButtonStyle = {
  width: '100%',
  justifyContent: 'center',
  fontSize: '1.1rem',
  padding: '16px'
};

const errorStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#64748b'
};

export default StudioDetail;