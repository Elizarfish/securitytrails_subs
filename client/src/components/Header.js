import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          📸 Фотостудии
        </Link>
        <nav className="nav">
          <Link to="/studios" className="nav-link">Студии</Link>
          {user && (
            <Link to="/my-bookings" className="nav-link">Мои бронирования</Link>
          )}
        </nav>
        <div className="auth-section">
          {user ? (
            <>
              <span className="user-info">Привет, {user.username}!</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Войти
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
