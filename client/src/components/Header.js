import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Calendar, Home, Building } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header style={headerStyle}>
      <div className="container" style={containerStyle}>
        <Link to="/" style={logoStyle}>
          <Camera size={32} />
          <span>PhotoStudio</span>
        </Link>
        
        <nav style={navStyle}>
          <Link 
            to="/" 
            style={{...navLinkStyle, ...(isActive('/') ? activeLinkStyle : {})}}
          >
            <Home size={20} />
            Главная
          </Link>
          <Link 
            to="/studios" 
            style={{...navLinkStyle, ...(isActive('/studios') ? activeLinkStyle : {})}}
          >
            <Building size={20} />
            Студии
          </Link>
          <Link 
            to="/my-bookings" 
            style={{...navLinkStyle, ...(isActive('/my-bookings') ? activeLinkStyle : {})}}
          >
            <Calendar size={20} />
            Мои бронирования
          </Link>
        </nav>
      </div>
    </header>
  );
};

const headerStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '1rem 0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '1.5rem',
  fontWeight: '700',
  color: 'white',
  textDecoration: 'none'
};

const navStyle = {
  display: 'flex',
  gap: '2rem',
  alignItems: 'center'
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'white',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  fontWeight: '500'
};

const activeLinkStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)'
};

export default Header;