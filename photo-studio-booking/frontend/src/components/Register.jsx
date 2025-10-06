import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    try {
      // Здесь будет реальный API запрос
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password,
      //     phone: formData.phone
      //   })
      // })

      // Заглушка для демо
      setTimeout(() => {
        const userData = {
          id: Math.floor(Math.random() * 1000),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          is_admin: false
        }
        onLogin(userData)
        navigate('/')
      }, 1000)

    } catch (error) {
      setError('Ошибка регистрации. Попробуйте еще раз.')
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
        Регистрация
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Имя:</label>
            <input
              type="text"
              id="name"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
            <label htmlFor="phone">Телефон:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
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
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтверждение пароля:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280' }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register