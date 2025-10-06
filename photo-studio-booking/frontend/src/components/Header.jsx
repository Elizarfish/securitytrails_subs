import React from 'react'
import { Link } from 'react-router-dom'

function Header({ user, onLogout }) {
  return (
    <header style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <Link to="/" style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#3b82f6',
          textDecoration: 'none'
        }}>
          PhotoStudio
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{
            color: '#374151',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'color 0.2s ease'
          }}>
            Студии
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#6b7280' }}>
                Привет, {user.name}!
              </span>
              {user.is_admin && (
                <Link to="/admin" style={{
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  Админ
                </Link>
              )}
              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                Выйти
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/login" style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Войти
              </Link>
              <Link to="/register" style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header