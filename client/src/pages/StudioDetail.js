import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import './StudioDetail.css';

function StudioDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/studios/${id}`)
      .then(res => res.json())
      .then(data => {
        setStudio(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить информацию о студии');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (bookingDate) {
      fetch(`/api/bookings/studio/${id}/date/${bookingDate}`)
        .then(res => res.json())
        .then(data => setBookedSlots(data))
        .catch(console.error);
    }
  }, [id, bookingDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studio_id: parseInt(id),
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Бронирование успешно создано! Стоимость: ${data.total_price} ₽`);
        setNotes('');
        // Refresh booked slots
        fetch(`/api/bookings/studio/${id}/date/${bookingDate}`)
          .then(res => res.json())
          .then(data => setBookedSlots(data));
      } else {
        setError(data.error || 'Не удалось создать бронирование');
      }
    } catch (err) {
      setError('Произошла ошибка при бронировании');
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let i = 9; i <= 21; i++) {
      options.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return options;
  };

  const isSlotBooked = (time) => {
    return bookedSlots.some(booking => {
      return time >= booking.start_time && time < booking.end_time;
    });
  };

  const calculatePrice = () => {
    if (!studio || !startTime || !endTime) return 0;
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const hours = end - start;
    return hours * studio.price_per_hour;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="container">
        <div className="error-message">Студия не найдена</div>
      </div>
    );
  }

  return (
    <div className="studio-detail-page">
      <div className="container">
        <div className="studio-detail">
          <div className="studio-header">
            <img src={studio.image_url} alt={studio.name} className="studio-hero-image" />
            <div className="studio-header-info">
              <h1>{studio.name}</h1>
              <p className="studio-location">📍 {studio.location}</p>
            </div>
          </div>

          <div className="studio-content">
            <div className="studio-main">
              <section className="studio-section">
                <h2>Описание</h2>
                <p>{studio.description}</p>
              </section>

              <section className="studio-section">
                <h2>Особенности</h2>
                <div className="amenities-list">
                  {studio.amenities.split(',').map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-icon">✓</span>
                      <span>{amenity.trim()}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="studio-section">
                <h2>Информация</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">💰</div>
                    <div>
                      <div className="info-label">Цена</div>
                      <div className="info-value">{studio.price_per_hour} ₽/час</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">👥</div>
                    <div>
                      <div className="info-label">Вместимость</div>
                      <div className="info-value">До {studio.capacity} человек</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="booking-sidebar">
              <div className="booking-card">
                <h2>Забронировать студию</h2>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Дата</label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      max={format(addDays(new Date(), 90), 'yyyy-MM-dd')}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Время начала</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time} disabled={isSlotBooked(time)}>
                          {time} {isSlotBooked(time) ? '(занято)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Время окончания</label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    >
                      {generateTimeOptions().filter(time => time > startTime).map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Примечания (опционально)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Дополнительная информация о фотосессии..."
                      rows="3"
                    />
                  </div>

                  <div className="booking-summary">
                    <div className="summary-row">
                      <span>Стоимость:</span>
                      <span className="summary-price">{calculatePrice()} ₽</span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block">
                    {user ? 'Забронировать' : 'Войти для бронирования'}
                  </button>
                </form>

                {bookedSlots.length > 0 && (
                  <div className="booked-slots">
                    <h3>Занятые слоты на {bookingDate}:</h3>
                    <ul>
                      {bookedSlots.map(booking => (
                        <li key={booking.id}>
                          {booking.start_time} - {booking.end_time}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudioDetail;
