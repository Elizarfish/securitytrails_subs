import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingAPI.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError('Ошибка загрузки бронирований');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      setBookings(bookings.filter(booking => booking._id !== bookingId));
    } catch (err: any) {
      setError('Ошибка отмены бронирования');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтверждено';
      case 'cancelled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  if (loading) {
    return <div className="loading">Загрузка бронирований...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-bookings">
      <h2>Мои бронирования</h2>
      
      {bookings.length === 0 ? (
        <p>У вас пока нет бронирований</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>
                  {typeof booking.studio === 'object' 
                    ? booking.studio.name 
                    : 'Студия'}
                </h3>
                <span 
                  className="status"
                  style={{ color: getStatusColor(booking.status) }}
                >
                  {getStatusText(booking.status)}
                </span>
              </div>
              
              <div className="booking-details">
                <p>
                  <strong>Дата:</strong> {format(new Date(booking.date), 'dd MMMM yyyy', { locale: ru })}
                </p>
                <p>
                  <strong>Время:</strong> {booking.startTime} - {booking.endTime}
                </p>
                <p>
                  <strong>Продолжительность:</strong> {booking.duration} {booking.duration === 1 ? 'час' : booking.duration < 5 ? 'часа' : 'часов'}
                </p>
                <p>
                  <strong>Стоимость:</strong> {booking.totalPrice} ₽
                </p>
                {booking.notes && (
                  <p>
                    <strong>Заметки:</strong> {booking.notes}
                  </p>
                )}
                {booking.specialRequests && (
                  <p>
                    <strong>Особые пожелания:</strong> {booking.specialRequests}
                  </p>
                )}
              </div>

              {booking.status === 'pending' && (
                <div className="booking-actions">
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="cancel-button"
                  >
                    Отменить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;