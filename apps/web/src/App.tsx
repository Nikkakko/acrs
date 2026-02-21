import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { SchedulePage } from './pages/SchedulePage';
import { StaffPage } from './pages/StaffPage';
import { ServicesPage } from './pages/ServicesPage';

export function App() {
  return (
    <div className="mx-auto min-h-screen max-w-[1180px] bg-background p-5">
      <Header />
      <main className="rounded-lg bg-card p-5 shadow-sm">
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>
      </main>
    </div>
  );
}
