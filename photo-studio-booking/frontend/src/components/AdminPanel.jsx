import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('studios')
  const [studios, setStudios] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [studiosRes, bookingsRes] = await Promise.all([
        fetch('/api/studios'),
        fetch('/api/bookings')
      ])

      if (studiosRes.ok) {
        const studiosData = await studiosRes.json()
        setStudios(studiosData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      // Здесь будет API запрос для обновления статуса
      // await fetch(`/api/bookings/${bookingId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // })

      // Для демо обновляем локально
      setBookings(bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status } : booking
      ))
    } catch (error) {
      console.error('Error updating booking:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6b7280'
      }}>
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1f2937'
        }}>
          Админ-панель
        </h1>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          На главную
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('studios')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'studios' ? '#3b82f6' : 'none',
            color: activeTab === 'studios' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Студии ({studios.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'bookings' ? '#3b82f6' : 'none',
            color: activeTab === 'bookings' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Бронирования ({bookings.length})
        </button>
      </div>

      {activeTab === 'studios' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <button
              className="btn"
              onClick={() => alert('Функция добавления студии будет реализована')}
            >
              Добавить студию
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {studios.map((studio) => (
              <div key={studio.id} className="card">
                <img
                  src={studio.image_url}
                  alt={studio.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {studio.name}
                </h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {studio.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#3b82f6'
                  }}>
                    {studio.price_per_hour} ₽/час
                  </span>
                  <span style={{
                    backgroundColor: studio.is_available ? '#dcfce7' : '#fee2e2',
                    color: studio.is_available ? '#166534' : '#991b1b',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {studio.is_available ? 'Доступна' : 'Недоступна'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {bookings.map((booking) => (
              <div key={booking.id} className="card">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Бронирование #{booking.id}
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                      Студия: {booking.Studio?.name || 'Неизвестно'}
                    </p>
                    <p style={{ color: '#6b7280' }}>
                      Пользователь: {booking.User?.name || 'Неизвестен'}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor:
                      booking.status === 'pending' ? '#fef3c7' :
                      booking.status === 'confirmed' ? '#dcfce7' :
                      booking.status === 'cancelled' ? '#fee2e2' : '#e5e7eb',
                    color:
                      booking.status === 'pending' ? '#92400e' :
                      booking.status === 'confirmed' ? '#166534' :
                      booking.status === 'cancelled' ? '#991b1b' : '#374151',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {booking.status === 'pending' ? 'Ожидает' :
                     booking.status === 'confirmed' ? 'Подтверждено' :
                     booking.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Дата:</span>
                    <p style={{ fontWeight: '500' }}>{booking.date}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Время:</span>
                    <p style={{ fontWeight: '500' }}>
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Стоимость:</span>
                    <p style={{ fontWeight: '500' }}>{booking.total_price} ₽</p>
                  </div>
                </div>

                {booking.notes && (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ color: '#6b7280' }}>Комментарии:</span>
                    <p style={{ marginTop: '4px', lineHeight: '1.5' }}>
                      {booking.notes}
                    </p>
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Подтвердить
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Отменить
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel