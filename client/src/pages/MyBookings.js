import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import './MyBookings.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = () => {
    const token = localStorage.getItem('token');

    fetch('/api/bookings/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Не удалось загрузить бронирования');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Вы уверены, что хотите отменить это бронирование?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchBookings();
      } else {
        const data = await response.json();
        alert(data.error || 'Не удалось отменить бронирование');
      }
    } catch (err) {
      alert('Произошла ошибка при отмене бронирования');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Ожидает', class: 'status-pending' },
      confirmed: { label: 'Подтверждено', class: 'status-confirmed' },
      cancelled: { label: 'Отменено', class: 'status-cancelled' },
      completed: { label: 'Завершено', class: 'status-completed' }
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <h1 className="page-title">Мои бронирования</h1>

        {error && <div className="error-message">{error}</div>}

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h2>У вас пока нет бронирований</h2>
            <p>Посмотрите доступные студии и забронируйте первую фотосессию</p>
            <a href="/studios" className="btn btn-primary">
              Посмотреть студии
            </a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-image">
                  <img src={booking.image_url} alt={booking.studio_name} />
                </div>
                <div className="booking-details">
                  <div className="booking-header">
                    <h3>{booking.studio_name}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="booking-info">
                    <div className="info-row">
                      <span className="info-icon">📍</span>
                      <span>{booking.location}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-icon">📅</span>
                      <span>
                        {format(parseISO(booking.booking_date + 'T00:00:00'), 'd MMMM yyyy', { locale: ru })}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-icon">🕒</span>
                      <span>{booking.start_time} - {booking.end_time}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-icon">💰</span>
                      <span className="booking-price">{booking.total_price} ₽</span>
                    </div>
                    {booking.notes && (
                      <div className="info-row">
                        <span className="info-icon">📝</span>
                        <span>{booking.notes}</span>
                      </div>
                    )}
                  </div>
                  {booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Отменить бронирование
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
