import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Найдите идеальную фотостудию
          </h1>
          <p className="hero-subtitle">
            Бронируйте профессиональные фотостудии онлайн быстро и удобно
          </p>
          <div className="hero-buttons">
            <Link to="/studios" className="btn btn-primary btn-lg">
              Посмотреть студии
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Начать сейчас
            </Link>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Удобное бронирование</h3>
              <p>Бронируйте студию в несколько кликов без звонков и ожидания</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Прозрачные цены</h3>
              <p>Никаких скрытых платежей - вы видите полную стоимость сразу</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Гибкое расписание</h3>
              <p>Выбирайте удобное время из доступных слотов в реальном времени</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Лучшие студии</h3>
              <p>Только проверенные студии с профессиональным оборудованием</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Готовы начать?</h2>
          <p>Создайте аккаунт и забронируйте свою первую фотостудию сегодня</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
