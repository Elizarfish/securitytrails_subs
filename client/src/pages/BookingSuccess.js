import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, User, Mail, Phone, ArrowRight, Home } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/dateUtils';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getById(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
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

  if (!booking) {
    return (
      <div style={containerStyle}>
        <div className="container">
          <div style={errorStyle}>
            <h2>Бронирование не найдено</h2>
            <Link to="/studios" className="btn btn-primary">
              Вернуться к студиям
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={successContainerStyle}>
          {/* Иконка успеха */}
          <div style={successIconStyle}>
            <CheckCircle size={80} />
          </div>

          {/* Заголовок */}
          <h1 style={titleStyle}>Бронирование успешно создано!</h1>
          <p style={subtitleStyle}>
            Ваша заявка принята и будет обработана в ближайшее время
          </p>

          {/* Детали бронирования */}
          <div className="card" style={bookingCardStyle}>
            <div style={bookingHeaderStyle}>
              <h2 style={bookingTitleStyle}>Детали бронирования</h2>
              <div style={bookingIdStyle}>ID: {booking.id}</div>
            </div>

            <div style={bookingDetailsStyle}>
              {/* Студия */}
              <div style={studioInfoStyle}>
                <h3 style={studioNameStyle}>{booking.studio_name}</h3>
                <div style={studioAddressStyle}>
                  <MapPin size={16} />
                  {booking.studio_address}
                </div>
              </div>

              {/* Дата и время */}
              <div style={dateTimeInfoStyle}>
                <div style={dateTimeItemStyle}>
                  <Calendar size={20} style={iconStyle} />
                  <div>
                    <div style={labelStyle}>Дата съемки</div>
                    <div style={valueStyle}>{formatDate(booking.start_datetime)}</div>
                  </div>
                </div>

                <div style={dateTimeItemStyle}>
                  <Clock size={20} style={iconStyle} />
                  <div>
                    <div style={labelStyle}>Время</div>
                    <div style={valueStyle}>
                      {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Контактная информация */}
              <div style={contactInfoStyle}>
                <h4 style={sectionTitleStyle}>Контактная информация</h4>
                
                <div style={contactItemStyle}>
                  <User size={16} style={contactIconStyle} />
                  <span>{booking.user_name}</span>
                </div>

                <div style={contactItemStyle}>
                  <Mail size={16} style={contactIconStyle} />
                  <span>{booking.user_email}</span>
                </div>

                {booking.user_phone && (
                  <div style={contactItemStyle}>
                    <Phone size={16} style={contactIconStyle} />
                    <span>{booking.user_phone}</span>
                  </div>
                )}
              </div>

              {/* Заметки */}
              {booking.notes && (
                <div style={notesStyle}>
                  <h4 style={sectionTitleStyle}>Дополнительные пожелания</h4>
                  <p style={notesTextStyle}>{booking.notes}</p>
                </div>
              )}

              {/* Стоимость */}
              <div style={priceContainerStyle}>
                <div style={priceLabelStyle}>Общая стоимость:</div>
                <div style={priceValueStyle}>
                  {booking.total_price.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
          </div>

          {/* Следующие шаги */}
          <div className="card" style={nextStepsStyle}>
            <h3 style={nextStepsTitleStyle}>Что дальше?</h3>
            <div style={stepsListStyle}>
              <div style={stepStyle}>
                <div style={stepNumberStyle}>1</div>
                <div style={stepTextStyle}>
                  Мы свяжемся с вами в течение 2 часов для подтверждения бронирования
                </div>
              </div>
              <div style={stepStyle}>
                <div style={stepNumberStyle}>2</div>
                <div style={stepTextStyle}>
                  Вы получите подробную информацию о студии и инструкции по прибытию
                </div>
              </div>
              <div style={stepStyle}>
                <div style={stepNumberStyle}>3</div>
                <div style={stepTextStyle}>
                  Приходите в назначенное время и наслаждайтесь съемкой!
                </div>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div style={actionsStyle}>
            <Link to="/my-bookings" className="btn btn-secondary">
              Мои бронирования
            </Link>
            <Link to="/studios" className="btn btn-primary">
              <ArrowRight size={16} />
              Забронировать еще
            </Link>
            <Link to="/" className="btn btn-secondary">
              <Home size={16} />
              На главную
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
  minHeight: 'calc(100vh - 80px)',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
};

const successContainerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  textAlign: 'center'
};

const successIconStyle = {
  color: '#10b981',
  marginBottom: '24px'
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '16px'
};

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#64748b',
  marginBottom: '40px'
};

const bookingCardStyle = {
  textAlign: 'left',
  marginBottom: '32px'
};

const bookingHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e5e7eb'
};

const bookingTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#1e293b',
  margin: 0
};

const bookingIdStyle = {
  fontSize: '0.9rem',
  color: '#64748b',
  fontFamily: 'monospace',
  background: '#f1f5f9',
  padding: '4px 8px',
  borderRadius: '4px'
};

const bookingDetailsStyle = {
  display: 'grid',
  gap: '24px'
};

const studioInfoStyle = {
  textAlign: 'center'
};

const studioNameStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '8px'
};

const studioAddressStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  color: '#64748b'
};

const dateTimeInfoStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const dateTimeItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '8px'
};

const iconStyle = {
  color: '#667eea',
  flexShrink: 0
};

const labelStyle = {
  fontSize: '0.8rem',
  color: '#64748b',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const valueStyle = {
  fontSize: '1rem',
  color: '#1e293b',
  fontWeight: '600'
};

const contactInfoStyle = {
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '8px'
};

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '12px'
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  color: '#374151'
};

const contactIconStyle = {
  color: '#64748b',
  flexShrink: 0
};

const notesStyle = {
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '8px'
};

const notesTextStyle = {
  color: '#374151',
  lineHeight: '1.6',
  margin: 0
};

const priceContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '8px'
};

const priceLabelStyle = {
  fontSize: '1.1rem',
  fontWeight: '500'
};

const priceValueStyle = {
  fontSize: '1.5rem',
  fontWeight: '700'
};

const nextStepsStyle = {
  textAlign: 'left',
  marginBottom: '32px'
};

const nextStepsTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '20px',
  textAlign: 'center'
};

const stepsListStyle = {
  display: 'grid',
  gap: '16px'
};

const stepStyle = {
  display: 'flex',
  gap: '16px',
  alignItems: 'start'
};

const stepNumberStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: '#667eea',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '0.9rem',
  flexShrink: 0
};

const stepTextStyle = {
  color: '#374151',
  lineHeight: '1.6'
};

const actionsStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap'
};

const errorStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#64748b'
};

export default BookingSuccess;