// Форматирование даты для отображения
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Форматирование времени
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Форматирование даты и времени
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Получение строки даты в формате YYYY-MM-DD
export const getDateString = (date) => {
  return date.toISOString().split('T')[0];
};

// Получение строки даты и времени в формате ISO
export const getDateTimeString = (date, time) => {
  const [hours, minutes] = time.split(':');
  const dateTime = new Date(date);
  dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return dateTime.toISOString();
};

// Проверка, что дата не в прошлом
export const isDateInFuture = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

// Получение минимальной даты (сегодня)
export const getMinDate = () => {
  return new Date();
};

// Получение максимальной даты (через 3 месяца)
export const getMaxDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date;
};

// Расчет продолжительности в часах
export const calculateDuration = (startDateTime, endDateTime) => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  return (end - start) / (1000 * 60 * 60);
};

// Генерация временных слотов
export const generateTimeSlots = (startHour = 9, endHour = 21, step = 1) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour += step) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};