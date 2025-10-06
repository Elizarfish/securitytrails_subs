import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StudioCard from './components/StudioCard';
import BookingForm from './components/BookingForm';
import MyBookings from './components/MyBookings';
import AdminPanel from './components/AdminPanel';
import { Studio } from './types';
import { studioAPI } from './services/api';
import './App.css';

const AppContent: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    loadStudios();
  }, []);

  const loadStudios = async () => {
    try {
      const data = await studioAPI.getAll();
      setStudios(data);
    } catch (err) {
      console.error('Ошибка загрузки студий:', err);
    }
  };

  const handleStudioSelect = (studio: Studio) => {
    if (user) {
      setSelectedStudio(studio);
      setShowBookingForm(true);
    } else {
      alert('Для бронирования необходимо войти в систему');
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedStudio(null);
    alert('Бронирование создано успешно!');
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="auth-container">
        {isLoginMode ? (
          <LoginForm onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
        )}
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>📸 Фотостудия Бронирование</h1>
          <nav>
            <a href="/">Студии</a>
            <a href="/my-bookings">Мои бронирования</a>
            {user.role === 'admin' && (
              <a href="/admin">Админ-панель</a>
            )}
            <button onClick={logout} className="logout-button">
              Выйти
            </button>
          </nav>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={
              <div className="studios-page">
                <h2>Выберите студию для бронирования</h2>
                <div className="studios-grid">
                  {studios.map((studio) => (
                    <StudioCard
                      key={studio._id}
                      studio={studio}
                      onSelect={handleStudioSelect}
                    />
                  ))}
                </div>
              </div>
            } />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route 
              path="/admin" 
              element={
                user.role === 'admin' ? 
                  <AdminPanel /> : 
                  <Navigate to="/" />
              } 
            />
          </Routes>
        </main>

        {showBookingForm && selectedStudio && (
          <BookingForm
            studio={selectedStudio}
            onSuccess={handleBookingSuccess}
            onCancel={() => {
              setShowBookingForm(false);
              setSelectedStudio(null);
            }}
          />
        )}
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;