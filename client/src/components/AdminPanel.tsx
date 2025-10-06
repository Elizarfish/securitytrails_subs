import React, { useState, useEffect } from 'react';
import { Booking, Studio } from '../types';
import { bookingAPI, studioAPI } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const AdminPanel: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'studios'>('bookings');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, studiosData] = await Promise.all([
        bookingAPI.getAllBookings(),
        studioAPI.getAll()
      ]);
      setBookings(bookingsData);
      setStudios(studiosData);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      ));
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
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
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="admin-panel">
      <h2>Панель администратора</h2>
      
      <div className="admin-tabs">
        <button
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          Бронирования
        </button>
        <button
          className={activeTab === 'studios' ? 'active' : ''}
          onClick={() => setActiveTab('studios')}
        >
          Студии
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div className="bookings-admin">
          <h3>Все бронирования</h3>
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card admin">
                <div className="booking-header">
                  <h4>
                    {typeof booking.studio === 'object' 
                      ? booking.studio.name 
                      : 'Студия'}
                  </h4>
                  <span 
                    className="status"
                    style={{ color: getStatusColor(booking.status) }}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
                
                <div className="booking-details">
                  <p>
                    <strong>Клиент:</strong> {typeof booking.user === 'object' ? booking.user.name : 'Неизвестно'}
                  </p>
                  <p>
                    <strong>Email:</strong> {typeof booking.user === 'object' ? booking.user.email : 'Неизвестно'}
                  </p>
                  <p>
                    <strong>Телефон:</strong> {typeof booking.user === 'object' ? booking.user.phone : 'Неизвестно'}
                  </p>
                  <p>
                    <strong>Дата:</strong> {format(new Date(booking.date), 'dd MMMM yyyy', { locale: ru })}
                  </p>
                  <p>
                    <strong>Время:</strong> {booking.startTime} - {booking.endTime}
                  </p>
                  <p>
                    <strong>Стоимость:</strong> {booking.totalPrice} ₽
                  </p>
                  {booking.notes && (
                    <p>
                      <strong>Заметки:</strong> {booking.notes}
                    </p>
                  )}
                </div>

                <div className="booking-actions">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                  >
                    <option value="pending">Ожидает подтверждения</option>
                    <option value="confirmed">Подтверждено</option>
                    <option value="cancelled">Отменено</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'studios' && (
        <div className="studios-admin">
          <h3>Управление студиями</h3>
          <div className="studios-list">
            {studios.map((studio) => (
              <div key={studio._id} className="studio-card admin">
                <h4>{studio.name}</h4>
                <p>{studio.description}</p>
                <p><strong>Адрес:</strong> {studio.address}</p>
                <p><strong>Цена за час:</strong> {studio.pricePerHour} ₽</p>
                <p><strong>Вместимость:</strong> {studio.capacity} чел.</p>
                <p><strong>Статус:</strong> {studio.isActive ? 'Активна' : 'Неактивна'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;