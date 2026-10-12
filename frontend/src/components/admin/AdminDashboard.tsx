import React, { useState, useEffect } from 'react';
import type { Appointment } from '../../types';
import { api } from '../../api/client';
import { Check, X, RefreshCw, ChevronLeft, ChevronRight, CalendarX2, Mail, Phone } from 'lucide-react';

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (iso: string) => new Date(iso + 'T00:00:00');

const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  PENDING: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Onaylandı', cls: 'bg-lime text-ink', dot: 'bg-ink' },
  CANCELLED: { label: 'İptal', cls: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
  COMPLETED: { label: 'Tamamlandı', cls: 'bg-ultra-100 text-ultra-700', dot: 'bg-ultra-600' }
};

export const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');
  const [loading, setLoading] = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    api.getAdminAppointments(selectedDate)
      .then(data => setAppointments(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      alert('Durum güncellenirken hata oluştu.');
    }
  };

  const shiftDay = (n: number) => {
    const d = parse(selectedDate);
    d.setDate(d.getDate() + n);
    setSelectedDate(toISO(d));
  };

  const d = parse(selectedDate);
  const count = (s: string) => appointments.filter(a => a.status === s).length;
  const stats = [
    { label: 'Toplam', value: appointments.length, cls: 'bg-ink text-white' },
    { label: 'Beklemede', value: count('PENDING'), cls: 'bg-white ring-1 ring-ink/5' },
    { label: 'Onaylı', value: count('CONFIRMED'), cls: 'bg-lime text-ink' },
    { label: 'İptal', value: count('CANCELLED'), cls: 'bg-white ring-1 ring-ink/5' }
  ];

  const navBtn =
    'w-11 h-11 grid place-items-center rounded-full bg-white ring-1 ring-ink/10 hover:ring-ink/30 transition';

  return (
    <div className="max-w-6xl mx-auto animate-rise">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-5xl tracking-tighter leading-none capitalize">
            {d.toLocaleDateString('tr-TR', { weekday: 'long' })}
          </h1>
          <p className="text-ink/60 mt-3 text-lg">
            {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} ajandası
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => shiftDay(-1)} className={navBtn} aria-label="Önceki gün">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => e.target.value && setSelectedDate(e.target.value)}
            className="h-11 px-4 rounded-full bg-white ring-1 ring-ink/10 text-sm font-medium outline-none focus:ring-2 focus:ring-ultra-500"
          />
          <button onClick={() => shiftDay(1)} className={navBtn} aria-label="Sonraki gün">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={fetchAppointments} className={navBtn} aria-label="Yenile">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.cls}`}>
            <div className="font-display font-extrabold text-5xl tabular-nums leading-none">{s.value}</div>
            <div className="text-sm mt-3 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-[2rem] ring-1 ring-ink/5 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-ultra-50 text-ultra-600 grid place-items-center mx-auto mb-4">
            <CalendarX2 className="w-6 h-6" />
          </div>
          <p className="font-display font-bold text-xl">Bu günde randevu yok</p>
          <p className="text-ink/50 text-sm mt-1">Yeni bir randevu oluşturulduğunda burada görünecek.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {appointments.map(app => {
            const st = STATUS[app.status] ?? STATUS.PENDING;
            const cancelled = app.status === 'CANCELLED';
            return (
              <li
                key={app.id}
                className={`bg-white rounded-3xl ring-1 ring-ink/5 p-5 flex flex-col md:flex-row md:items-center gap-5 transition hover:shadow-lg hover:shadow-ink/5 ${
                  cancelled ? 'opacity-60' : ''
                }`}
              >
                <div className="md:w-36 shrink-0">
                  <div className="font-display font-extrabold text-3xl tabular-nums tracking-tight">
                    {app.startTime.substring(0, 5)}
                  </div>
                  <div className="text-sm text-ink/50 tabular-nums">{app.endTime.substring(0, 5)} bitiş</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg">{app.customerFullName}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/60 mt-1">
                    <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{app.customerEmail}</span>
                    <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{app.customerPhone}</span>
                  </div>
                  {app.notes && <p className="text-sm text-ink/50 italic mt-2">“{app.notes}”</p>}
                </div>

                <div className="md:w-52 shrink-0 text-sm">
                  <div className="font-medium">{app.specialistFullName}</div>
                  <div className="text-ink/50">{app.specialistTitle}</div>
                </div>

                <div className="flex items-center gap-3 md:justify-end md:w-72 shrink-0">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${st.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  {app.status !== 'CONFIRMED' && app.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange(app.id, 'CONFIRMED')}
                      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ultra-600 transition"
                    >
                      <Check className="w-4 h-4" /> Onayla
                    </button>
                  )}
                  {app.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange(app.id, 'CANCELLED')}
                      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full ring-1 ring-ink/10 text-sm font-semibold text-ink/70 hover:ring-rose-400 hover:text-rose-700 transition"
                    >
                      <X className="w-4 h-4" /> İptal et
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
