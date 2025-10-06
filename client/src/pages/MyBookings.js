import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDateTime, formatDate, formatTime } from '../utils/dateUtils';

const MyBookings = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Введите email для поиска бронирований');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await usersAPI.getBookings(email);
      setBookings(response.data);
      
      if (response.data.length === 0) {
        toast.info('Бронирования не найдены');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info('Бронирования не найдены для указанного email');
        setBookings([]);
      } else {
        toast.error('Ошибка поиска бронирований');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return styles[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено',
      completed: 'Завершено'
    };
    return texts[status] || status;
  };

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={headerStyle}>
          <h1 style={titleStyle}>Мои бронирования</h1>
          <p style={subtitleStyle}>
            Введите ваш email для просмотра всех бронирований
          </p>
        </div>

        {/* Форма поиска */}
        <div className="card" style={searchCardStyle}>
          <form onSubmit={handleSearch} style={searchFormStyle}>
            <div style={searchInputGroupStyle}>
              <Mail size={20} style={searchIconStyle} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                style={searchInputStyle}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={searchButtonStyle}
            >
              {loading ? 'Поиск...' : 'Найти бронирования'}
            </button>
          </form>
        </div>

        {/* Результаты поиска */}
        {searched && (
          <div style={resultsStyle}>
            {bookings.length > 0 ? (
              <div style={bookingsGridStyle}>
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <Calendar size={48} style={emptyIconStyle} />
                <h3>Бронирования не найдены</h3>
                <p>У вас пока нет бронирований или проверьте правильность email</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BookingCard = ({ booking }) => {
  return (
    <div className="card" style={bookingCardStyle}>
      <div style={bookingHeaderStyle}>
        <div>
          <h3 style={studioNameStyle}>{booking.studio_name}</h3>
          <div style={bookingDateStyle}>
            <Calendar size={16} />
            {formatDate(booking.start_datetime)}
          </div>
        </div>
        <div style={statusContainerStyle}>
          <span className={getStatusStyle(booking.status)}>
            {getStatusText(booking.status)}
          </span>
        </div>
      </div>

      <div style={bookingDetailsStyle}>
        <div style={detailRowStyle}>
          <Clock size={16} style={iconStyle} />
          <span>
            {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
          </span>
        </div>

        <div style={detailRowStyle}>
          <MapPin size={16} style={iconStyle} />
          <span>{booking.studio_address}</span>
        </div>

        <div style={detailRowStyle}>
          <User size={16} style={iconStyle} />
          <span>{booking.user_name}</span>
        </div>

        {booking.user_phone && (
          <div style={detailRowStyle}>
            <Phone size={16} style={iconStyle} />
            <span>{booking.user_phone}</span>
          </div>
        )}

        {booking.notes && (
          <div style={notesStyle}>
            <MessageSquare size={16} style={iconStyle} />
            <span>{booking.notes}</span>
          </div>
        )}
      </div>

      <div style={bookingFooterStyle}>
        <div style={priceStyle}>
          {booking.total_price.toLocaleString('ru-RU')} ₽
        </div>
        <div style={bookingIdStyle}>
          ID: {booking.id}
        </div>
      </div>
    </div>
  );
};

// Функции для статуса (дублируем здесь для использования в компоненте)
const getStatusStyle = (status) => {
  const styles = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    cancelled: 'status-cancelled',
    completed: 'status-completed'
  };
  return styles[status] || 'status-pending';
};

const getStatusText = (status) => {
  const texts = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено'
  };
  return texts[status] || status;
};

// Стили
const containerStyle = {
  padding: '40px 0',
  minHeight: 'calc(100vh - 80px)'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '32px'
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '16px'
};

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#64748b'
};

const searchCardStyle = {
  marginBottom: '32px',
  padding: '24px'
};

const searchFormStyle = {
  display: 'flex',
  gap: '16px',
  alignItems: 'end'
};

const searchInputGroupStyle = {
  position: 'relative',
  flex: 1
};

const searchIconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b'
};

const searchInputStyle = {
  width: '100%',
  paddingLeft: '44px',
  paddingRight: '16px',
  paddingTop: '12px',
  paddingBottom: '12px',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '16px',
  transition: 'border-color 0.2s ease'
};

const searchButtonStyle = {
  whiteSpace: 'nowrap'
};

const resultsStyle = {
  marginTop: '32px'
};

const bookingsGridStyle = {
  display: 'grid',
  gap: '24px'
};

const bookingCardStyle = {
  transition: 'all 0.3s ease'
};

const bookingHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  marginBottom: '16px'
};

const studioNameStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '8px'
};

const bookingDateStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#64748b',
  fontSize: '0.9rem'
};

const statusContainerStyle = {
  textAlign: 'right'
};

const bookingDetailsStyle = {
  display: 'grid',
  gap: '8px',
  marginBottom: '16px'
};

const detailRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#374151',
  fontSize: '0.9rem'
};

const iconStyle = {
  color: '#64748b',
  flexShrink: 0
};

const notesStyle = {
  display: 'flex',
  alignItems: 'start',
  gap: '8px',
  color: '#374151',
  fontSize: '0.9rem',
  marginTop: '8px',
  padding: '8px',
  background: '#f8fafc',
  borderRadius: '6px'
};

const bookingFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '16px'
};

const priceStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: '#667eea'
};

const bookingIdStyle = {
  fontSize: '0.8rem',
  color: '#64748b',
  fontFamily: 'monospace'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#64748b'
};

const emptyIconStyle = {
  color: '#cbd5e1',
  marginBottom: '16px'
};

export default MyBookings;