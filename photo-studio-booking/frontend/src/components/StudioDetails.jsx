import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function StudioDetails() {
  const { id } = useParams()
  const [studio, setStudio] = useState(null)

  useEffect(() => {
    fetchStudio()
  }, [id])

  const fetchStudio = async () => {
    try {
      const response = await fetch(`/api/studios/${id}`)
      if (response.ok) {
        const data = await response.json()
        setStudio(data)
      }
    } catch (error) {
      console.error('Error fetching studio:', error)
    }
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
        <Link to="/" style={{
          color: '#3b82f6',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ← Назад к студиям
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        <div>
          <img
            src={studio.image_url}
            alt={studio.name}
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
          />
        </div>

        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            {studio.name}
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '24px',
            lineHeight: '1.7'
          }}>
            {studio.description}
          </p>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Информация
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <span style={{ color: '#6b7280' }}>Стоимость:</span>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#3b82f6' }}>
                  {studio.price_per_hour} ₽/час
                </p>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Вместимость:</span>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                  До {studio.max_capacity} человек
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#6b7280' }}>Оборудование:</span>
              <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
                {studio.equipment}
              </p>
            </div>
          </div>

          <Link
            to={`/book/${studio.id}`}
            className="btn"
            style={{ width: '100%', textAlign: 'center', fontSize: '18px' }}
          >
            Забронировать студию
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudioDetails