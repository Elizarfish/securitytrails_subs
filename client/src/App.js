import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Home from './pages/Home';
import Studios from './pages/Studios';
import StudioDetail from './pages/StudioDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import BookingSuccess from './pages/BookingSuccess';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studios" element={<Studios />} />
            <Route path="/studios/:id" element={<StudioDetail />} />
            <Route path="/booking/:studioId" element={<Booking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/booking-success/:bookingId" element={<BookingSuccess />} />
          </Routes>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;