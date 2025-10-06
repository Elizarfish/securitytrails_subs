import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import { studiosAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { getDateString, getDateTimeString, generateTimeSlots, calculateDuration } from '../utils/dateUtils';

const Booking = () => {
  const { studioId } = useParams();
  const navigate = useNavigate();
  
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Форма бронирования
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    notes: ''
  });
  
  const [availability, setAvailability] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const timeSlots = generateTimeSlots(9, 21);

  useEffect(() => {
    fetchStudio();
  }, [studioId]);

  useEffect(() => {
    if (formData.date) {
      checkAvailability();
    }
  }, [formData.date]);

  useEffect(() => {
    calculatePrice();
  }, [formData.startTime, formData.endTime, studio]);

  const fetchStudio = async () => {
    try {
      const response = await studiosAPI.getById(studioId);
      setStudio(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки студии');
      navigate('/studios');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await studiosAPI.getAvailability(studioId, formData.date);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const calculatePrice = () => {
    if (!formData.startTime || !formData.endTime || !studio) {
      setTotalPrice(0);
      return;
    }

    const startDateTime = getDateTimeString(new Date(formData.date), formData.startTime);
    const endDateTime = getDateTimeString(new Date(formData.date), formData.endTime);
    
    const duration = calculateDuration(startDateTime, endDateTime);
    if (duration > 0) {
      setTotalPrice(Math.round(duration * studio.price_per_hour));
    } else {
      setTotalPrice(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isTimeSlotAvailable = (time) => {
    if (!availability) return true;
    
    const hour = parseInt(time.split(':')[0]);
    return !availability.bookedSlots.some(slot => {
      const startHour = new Date(slot.start_datetime).getHours();
      const endHour = new Date(slot.end_datetime).getHours();
      return hour >= startHour && hour < endHour;
    });
  };

  const validateForm = () => {
    const { date, startTime, endTime, userName, userEmail } = formData;
    
    if (!date || !startTime || !endTime || !userName || !userEmail) {
      toast.error('Заполните все обязательные поля');
      return false;
    }

    if (startTime >= endTime) {
      toast.error('Время окончания должно быть больше времени начала');
      return false;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Нельзя бронировать на прошедшую дату');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    
    try {
      const startDateTime = getDateTimeString(new Date(formData.date), formData.startTime);
      const endDateTime = getDateTimeString(new Date(formData.date), formData.endTime);
      
      const bookingData = {
        studio_id: parseInt(studioId),
        user_name: formData.userName,
        user_email: formData.userEmail,
        user_phone: formData.userPhone,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        notes: formData.notes
      };

      const response = await bookingsAPI.create(bookingData);
      toast.success('Бронирование успешно создано!');
      navigate(`/booking-success/${response.data.id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ошибка создания бронирования';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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
          </div>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div style={containerStyle}>
      <div className="container">
        {/* Заголовок */}
        <div style={headerStyle}>
          <button
            onClick={() => navigate(-1)}
            style={backButtonStyle}
          >
            <ArrowLeft size={16} />
            Назад
          </button>
          <h1 style={titleStyle}>Бронирование студии</h1>
        </div>

        <div style={contentStyle}>
          {/* Информация о студии */}
          <div className="card" style={studioInfoStyle}>
            <img
              src={studio.image_url || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop'}
              alt={studio.name}
              style={studioImageStyle}
            />
            <div style={studioDetailsStyle}>
              <h3 style={studioNameStyle}>{studio.name}</h3>
              <p style={studioAddressStyle}>{studio.address}</p>
              <div style={studioPriceStyle}>
                {studio.price_per_hour.toLocaleString('ru-RU')} ₽/час
              </div>
            </div>
          </div>

          {/* Форма бронирования */}
          <div className="card" style={formCardStyle}>
            <h2 style={formTitleStyle}>Детали бронирования</h2>
            
            <form onSubmit={handleSubmit} style={formStyle}>
              {/* Дата */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Дата съемки *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={minDate}
                  max={maxDate}
                  className="form-input"
                  required
                />
              </div>

              {/* Время */}
              <div style={timeGridStyle}>
                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Время начала *
                  </label>
                  <select
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Выберите время</option>
                    {timeSlots.map(time => (
                      <option
                        key={time}
                        value={time}
                        disabled={!isTimeSlotAvailable(time)}
                      >
                        {time} {!isTimeSlotAvailable(time) ? '(занято)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Время окончания *
                  </label>
                  <select
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Выберите время</option>
                    {timeSlots.slice(1).map(time => (
                      <option
                        key={time}
                        value={time}
                        disabled={time <= formData.startTime}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Контактная информация */}
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Ваше имя *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Телефон
                </label>
                <input
                  type="tel"
                  name="userPhone"
                  value={formData.userPhone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MessageSquare size={16} />
                  Дополнительные пожелания
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Опишите особые требования к съемке..."
                />
              </div>

              {/* Итоговая стоимость */}
              {totalPrice > 0 && (
                <div style={totalPriceStyle}>
                  <div style={totalPriceLabelStyle}>Итоговая стоимость:</div>
                  <div style={totalPriceValueStyle}>
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              )}

              {/* Кнопка отправки */}
              <button
                type="submit"
                className="btn btn-primary"
                style={submitButtonStyle}
                disabled={submitting || totalPrice === 0}
              >
                {submitting ? 'Создание бронирования...' : 'Забронировать'}
              </button>
            </form>
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
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '32px'
};

const backButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'none',
  border: 'none',
  color: '#667eea',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500'
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#1e293b',
  margin: 0
};

const contentStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 2fr',
  gap: '32px',
  alignItems: 'start'
};

const studioInfoStyle = {
  position: 'sticky',
  top: '24px'
};

const studioImageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '16px'
};

const studioDetailsStyle = {
  textAlign: 'center'
};

const studioNameStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '8px'
};

const studioAddressStyle = {
  color: '#64748b',
  marginBottom: '12px'
};

const studioPriceStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#667eea'
};

const formCardStyle = {
  padding: '32px'
};

const formTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '24px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const timeGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const totalPriceStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '8px',
  border: '2px solid #e2e8f0'
};

const totalPriceLabelStyle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#374151'
};

const totalPriceValueStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#667eea'
};

const submitButtonStyle = {
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

export default Booking;