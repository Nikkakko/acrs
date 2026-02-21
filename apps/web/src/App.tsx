import { NavLink, Route, Routes } from 'react-router-dom';
import { SchedulePage } from './pages/SchedulePage';
import { StaffPage } from './pages/StaffPage';
import { ServicesPage } from './pages/ServicesPage';

export function App() {
  return (
    <div className="layout">
      <header className="header">
        <h1>Aesthetic Center Reservation System</h1>
        <nav>
          <NavLink to="/schedule">Schedule</NavLink>
          <NavLink to="/staff">Staff</NavLink>
          <NavLink to="/services">Services</NavLink>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>
      </main>
    </div>
  );
}
