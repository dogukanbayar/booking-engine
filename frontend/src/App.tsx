import { useState } from 'react';
import { BookingFlow } from './components/booking/BookingFlow';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CalendarDays, LayoutDashboard } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'admin'>('booking');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
              B
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">BookingEngine</span>
              <span className="text-xs text-slate-500 block leading-none">Smart Appointment System</span>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'booking'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Randevu Al
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Yönetici Paneli
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="py-10 px-4">
        {activeTab === 'booking' ? <BookingFlow /> : <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
