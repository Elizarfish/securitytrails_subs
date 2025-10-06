import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Clock, MapPin, Star, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={heroStyle}>
        <div className="container">
          <div style={heroContentStyle}>
            <div style={heroTextStyle}>
              <h1 style={heroTitleStyle} className="fade-in">
                Забронируйте идеальную фотостудию
              </h1>
              <p style={heroSubtitleStyle} className="fade-in">
                Найдите и забронируйте профессиональную фотостудию для ваших проектов. 
                Простое бронирование, лучшие цены, проверенные студии.
              </p>
              <div style={heroButtonsStyle} className="fade-in">
                <Link to="/studios" className="btn btn-primary">
                  <Camera size={20} />
                  Найти студию
                </Link>
                <Link to="/my-bookings" className="btn btn-secondary">
                  Мои бронирования
                </Link>
              </div>
            </div>
            <div style={heroImageStyle}>
              <img 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop" 
                alt="Фотостудия" 
                style={heroImageImgStyle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={featuresStyle}>
        <div className="container">
          <h2 style={sectionTitleStyle}>Почему выбирают нас</h2>
          <div className="grid grid-cols-3">
            <div className="card text-center fade-in">
              <div style={featureIconStyle}>
                <Clock size={48} />
              </div>
              <h3 style={featureTitleStyle}>Быстрое бронирование</h3>
              <p style={featureDescStyle}>
                Забронируйте студию за несколько кликов. Моментальное подтверждение и удобный интерфейс.
              </p>
            </div>
            
            <div className="card text-center fade-in">
              <div style={featureIconStyle}>
                <MapPin size={48} />
              </div>
              <h3 style={featureTitleStyle}>Лучшие локации</h3>
              <p style={featureDescStyle}>
                Студии в центре города с удобной транспортной доступностью и парковкой.
              </p>
            </div>
            
            <div className="card text-center fade-in">
              <div style={featureIconStyle}>
                <Star size={48} />
              </div>
              <h3 style={featureTitleStyle}>Высокое качество</h3>
              <p style={featureDescStyle}>
                Профессиональное оборудование, качественное освещение и современные интерьеры.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaStyle}>
        <div className="container">
          <div className="card" style={ctaCardStyle}>
            <h2 style={ctaTitleStyle}>Готовы начать съемку?</h2>
            <p style={ctaDescStyle}>
              Выберите подходящую студию и забронируйте удобное время прямо сейчас
            </p>
            <Link to="/studios" className="btn btn-primary" style={ctaButtonStyle}>
              Посмотреть студии
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Стили
const heroStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '80px 0',
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center'
};

const heroContentStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '60px',
  alignItems: 'center'
};

const heroTextStyle = {
  maxWidth: '500px'
};

const heroTitleStyle = {
  fontSize: '3.5rem',
  fontWeight: '800',
  marginBottom: '24px',
  lineHeight: '1.2'
};

const heroSubtitleStyle = {
  fontSize: '1.25rem',
  marginBottom: '32px',
  opacity: '0.9',
  lineHeight: '1.6'
};

const heroButtonsStyle = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap'
};

const heroImageStyle = {
  textAlign: 'center'
};

const heroImageImgStyle = {
  width: '100%',
  maxWidth: '500px',
  borderRadius: '16px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

const featuresStyle = {
  padding: '80px 0',
  background: '#f8fafc'
};

const sectionTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: '60px',
  color: '#1e293b'
};

const featureIconStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '24px',
  color: '#667eea'
};

const featureTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  marginBottom: '16px',
  color: '#1e293b'
};

const featureDescStyle = {
  color: '#64748b',
  lineHeight: '1.6'
};

const ctaStyle = {
  padding: '80px 0',
  background: 'white'
};

const ctaCardStyle = {
  textAlign: 'center',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  border: 'none'
};

const ctaTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  marginBottom: '16px',
  color: '#1e293b'
};

const ctaDescStyle = {
  fontSize: '1.25rem',
  color: '#64748b',
  marginBottom: '32px'
};

const ctaButtonStyle = {
  fontSize: '1.125rem',
  padding: '16px 32px'
};

export default Home;