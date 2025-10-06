import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Studios.css';

function Studios() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/studios')
      .then(res => res.json())
      .then(data => {
        setStudios(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Не удалось загрузить студии');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="studios-page">
      <div className="container">
        <h1 className="page-title">Наши фотостудии</h1>
        <p className="page-subtitle">Выберите идеальную студию для вашей фотосессии</p>
        
        <div className="studios-grid">
          {studios.map(studio => (
            <div key={studio.id} className="studio-card">
              <div className="studio-image">
                <img src={studio.image_url} alt={studio.name} />
              </div>
              <div className="studio-info">
                <h3 className="studio-name">{studio.name}</h3>
                <p className="studio-description">{studio.description}</p>
                <div className="studio-details">
                  <div className="detail">
                    <span className="detail-icon">📍</span>
                    <span>{studio.location}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-icon">👥</span>
                    <span>До {studio.capacity} человек</span>
                  </div>
                  <div className="detail">
                    <span className="detail-icon">🎨</span>
                    <span>{studio.amenities}</span>
                  </div>
                </div>
                <div className="studio-footer">
                  <div className="studio-price">
                    <span className="price-amount">{studio.price_per_hour} ₽</span>
                    <span className="price-unit">/час</span>
                  </div>
                  <Link to={`/studios/${studio.id}`} className="btn btn-primary">
                    Забронировать
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Studios;
