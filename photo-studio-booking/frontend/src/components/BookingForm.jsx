import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function BookingForm({ user }) {
  const { studioId } = useParams()
  const navigate = useNavigate()
  const [studio, setStudio] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchStudio()
  }, [user, navigate])

  const fetchStudio = async () => {
    try {
      const response = await fetch(`/api/studios/${studioId}`)
      if (response.ok) {
        const data = await response.json()
        setStudio(data)
      }
    } catch (error) {
      console.error('Error fetching studio:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const calculateTotalPrice = () => {
    if (!formData.start_time || !formData.end_time || !studio) return 0

    const start = new Date(`2000-01-01T${formData.start_time}`)
    const end = new Date(`2000-01-01T${formData.end_time}`)
    const hours = (end - start) / (1000 * 60 * 60)

    return studio.price_per_hour * hours
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studio_id: parseInt(studioId),
          user_id: user.id,
          ...formData,
          total_price: calculateTotalPrice()
        })
      })

      if (response.ok) {
        alert('Бронирование успешно создано!')
        navigate('/')
      } else {
        alert('Ошибка при создании бронирования')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Ошибка при создании бронирования')
    }
    setLoading(false)
  }

  if (!user) {
    return null // Будет перенаправлено в useEffect
  }

  if (!studio) {
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
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate(`/studios/${studioId}`)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Назад к студии
        </button>
      </div>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          marginBottom: '32px',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          Забронировать студию
        </h1>

        <div className="card">
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            {studio.name}
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            {studio.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Детали бронирования
          </h3>

          <div className="form-group">
            <label htmlFor="date">Дата:</label>
            <input
              type="date"
              id="date"
              name="date"
              className="input"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div className="form-group">
              <label htmlFor="start_time">Время начала:</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                className="input"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">Время окончания:</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                className="input"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.start_time && formData.end_time && (
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontWeight: '500', color: '#1f2937' }}>
                Стоимость: {calculateTotalPrice()} ₽
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Комментарии (необязательно):</label>
            <textarea
              id="notes"
              name="notes"
              className="input"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Особые пожелания, требования к оборудованию и т.д."
            />
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', fontSize: '18px' }}
            disabled={loading}
          >
            {loading ? 'Создание бронирования...' : 'Забронировать'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookingForm