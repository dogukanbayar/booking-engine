import { useState } from 'react';
import { BookingFlow } from './components/booking/BookingFlow';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CalendarDays, LayoutDashboard } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'admin'>('booking');

  const tab = (id: 'booking' | 'admin') =>
    `flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
      activeTab === id ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-mist/70">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ultra-600 grid place-items-center">
              <span className="w-3.5 h-3.5 rounded-full bg-lime" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">BookingEngine</span>
          </div>

          <nav className="flex bg-white p-1 rounded-full ring-1 ring-ink/5 shadow-sm">
            <button onClick={() => setActiveTab('booking')} className={tab('booking')}>
              <CalendarDays className="w-4 h-4" /> Randevu al
            </button>
            <button onClick={() => setActiveTab('admin')} className={tab('admin')}>
              <LayoutDashboard className="w-4 h-4" /> Yönetim
            </button>
          </nav>
        </div>
      </header>

      <main className="px-4 pt-4 pb-16">
        {activeTab === 'booking' ? <BookingFlow /> : <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
