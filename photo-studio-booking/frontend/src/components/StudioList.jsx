import React from 'react'
import { Link } from 'react-router-dom'

function StudioList({ studios }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937' }}>
          Доступные фотостудии
        </h1>
      </div>

      {studios.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280'
        }}>
          <p>Загрузка студий...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {studios.map((studio) => (
            <div key={studio.id} className="card" style={{
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={studio.image_url}
                  alt={studio.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1f2937'
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
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#3b82f6'
                }}>
                  {studio.price_per_hour} ₽/час
                </span>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  До {studio.max_capacity} человек
                </span>
              </div>

              <Link
                to={`/studios/${studio.id}`}
                className="btn"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Подробнее
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudioList