import React, { useState, useEffect } from 'react';
import type { Appointment } from '../../types';
import { api } from '../../api/client';
import { Calendar, Check, X, RefreshCw } from 'lucide-react';

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

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Yönetim Paneli & Randevu Takibi</h2>
          <p className="text-sm text-slate-500 mt-1">Günlük ajanda ve randevu statü yönetimi</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchAppointments}
            className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Seçilen tarihte ({selectedDate}) kayıtlı randevu bulunmuyor.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-3 px-4">Saat</th>
                <th className="py-3 px-4">Uzman</th>
                <th className="py-3 px-4">Müşteri</th>
                <th className="py-3 px-4">İletişim</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {app.startTime.substring(0, 5)} - {app.endTime.substring(0, 5)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-900">{app.specialistFullName}</div>
                    <div className="text-xs text-slate-500">{app.specialistTitle}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-900">{app.customerFullName}</div>
                    {app.notes && <div className="text-xs text-slate-500 italic mt-0.5">"{app.notes}"</div>}
                  </td>
                  <td className="py-4 px-4 text-slate-600 text-xs">
                    <div>{app.customerEmail}</div>
                    <div>{app.customerPhone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                      app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    {app.status !== 'CONFIRMED' && app.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusChange(app.id, 'CONFIRMED')}
                        className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                        title="Onayla"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {app.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusChange(app.id, 'CANCELLED')}
                        className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                        title="İptal Et"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
