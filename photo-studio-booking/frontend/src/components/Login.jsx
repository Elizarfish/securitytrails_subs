import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Для демо используем тестового админа
      if (formData.email === 'admin@photostudio.com' && formData.password === 'admin123') {
        const userData = {
          id: 1,
          name: 'Администратор',
          email: formData.email,
          is_admin: true
        }
        onLogin(userData)
        navigate('/')
        return
      }

      // Здесь будет реальный API запрос
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // Заглушка для демо
      setTimeout(() => {
        const userData = {
          id: 2,
          name: 'Пользователь',
          email: formData.email,
          is_admin: false
        }
        onLogin(userData)
        navigate('/')
      }, 1000)

    } catch (error) {
      setError('Ошибка входа. Попробуйте еще раз.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '40px 0'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '32px',
        color: '#1f2937',
        textAlign: 'center'
      }}>
        Вход в аккаунт
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div style={{
              color: '#dc2626',
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: '#fef2f2',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', fontSize: '18px' }}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280' }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#eff6ff',
          borderRadius: '8px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#1f2937',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Демо-аккаунт:
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            admin@photostudio.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login