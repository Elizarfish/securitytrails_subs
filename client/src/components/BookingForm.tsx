import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Studio, TimeSlot } from '../types';
import { bookingAPI } from '../services/api';
import 'react-calendar/dist/Calendar.css';

interface BookingFormProps {
  studio: Studio;
  onSuccess: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ studio, onSuccess, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAvailableSlots();
  }, [selectedDate, studio._id]);

  const loadAvailableSlots = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = await bookingAPI.getAvailableSlots(studio._id, dateStr);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    } catch (err: any) {
      setError('Ошибка загрузки доступных слотов');
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    setError('');

    try {
      const endTime = new Date();
      endTime.setHours(parseInt(selectedSlot.startTime.split(':')[0]) + duration);
      endTime.setMinutes(parseInt(selectedSlot.startTime.split(':')[1]));

      await bookingAPI.create({
        studioId: studio._id,
        date: selectedDate.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: endTime.toTimeString().slice(0, 5),
        duration,
        notes,
        specialRequests
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания бронирования');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedSlot ? selectedSlot.price * duration : 0;
  };

  return (
    <div className="booking-form-overlay">
      <div className="booking-form">
        <h2>Бронирование: {studio.name}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Выберите дату</h3>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              locale="ru-RU"
            />
          </div>

          <div className="form-section">
            <h3>Выберите время</h3>
            <div className="time-slots">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot.startTime} - {slot.endTime}
                    <br />
                    <small>{slot.price} ₽/час</small>
                  </button>
                ))
              ) : (
                <p>На выбранную дату нет доступных слотов</p>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Продолжительность</h3>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={!selectedSlot}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                <option key={hours} value={hours}>
                  {hours} {hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h3>Дополнительная информация</h3>
            <textarea
              placeholder="Заметки к бронированию"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <textarea
              placeholder="Особые пожелания"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
            />
          </div>

          {selectedSlot && (
            <div className="price-summary">
              <h3>Итого: {calculateTotalPrice()} ₽</h3>
              <p>
                {selectedSlot.startTime} - {new Date(selectedDate.getTime() + (duration * 60 * 60 * 1000)).toTimeString().slice(0, 5)}
                <br />
                {duration} {duration === 1 ? 'час' : duration < 5 ? 'часа' : 'часов'} × {selectedSlot.price} ₽
              </p>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onCancel}>
              Отмена
            </button>
            <button
              type="submit"
              disabled={!selectedSlot || loading}
            >
              {loading ? 'Создание...' : 'Забронировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;