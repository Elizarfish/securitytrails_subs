import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import StudioList from './components/StudioList'
import StudioDetails from './components/StudioDetails'
import BookingForm from './components/BookingForm'
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'
import AdminPanel from './components/AdminPanel'

function App() {
  const [studios, setStudios] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchStudios()
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const fetchStudios = async () => {
    try {
      const response = await fetch('/api/studios')
      if (response.ok) {
        const data = await response.json()
        setStudios(data)
      }
    } catch (error) {
      console.error('Error fetching studios:', error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />

        <main className="container" style={{ padding: '80px 0 40px' }}>
          <Routes>
            <Route path="/" element={<StudioList studios={studios} />} />
            <Route path="/studios/:id" element={<StudioDetails />} />
            <Route path="/book/:studioId" element={<BookingForm user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            {user && user.is_admin && (
              <Route path="/admin" element={<AdminPanel />} />
            )}
          </Routes>
        </main>

        <footer style={{
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '40px 0',
          marginTop: '80px'
        }}>
          <div className="container text-center">
            <p>&copy; 2024 Бронирование фотостудии. Все права защищены.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App