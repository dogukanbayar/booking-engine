import type { Specialist, Appointment, CreateAppointmentPayload } from '../types';

const BASE_URL = 'http://localhost:8080/api/v1';

export const api = {
  getSpecialists: async (): Promise<Specialist[]> => {
    const res = await fetch(`${BASE_URL}/specialists`);
    if (!res.ok) throw new Error('Uzmanlar yüklenemedi.');
    return res.json();
  },

  getAvailableSlots: async (specialistId: number, date: string): Promise<string[]> => {
    const res = await fetch(`${BASE_URL}/specialists/${specialistId}/available-slots?date=${date}`);
    if (!res.ok) throw new Error('Müsait saatler alınamadı.');
    return res.json();
  },

  createAppointment: async (payload: CreateAppointmentPayload): Promise<Appointment> => {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Randevu oluşturulurken bir hata oluştu.');
    }
    return data;
  },

  getAdminAppointments: async (date?: string, specialistId?: number): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (specialistId) params.append('specialistId', specialistId.toString());

    const res = await fetch(`${BASE_URL}/admin/appointments?${params.toString()}`);
    if (!res.ok) throw new Error('Randevular getirilemedi.');
    return res.json();
  },

  updateStatus: async (id: number, status: string): Promise<Appointment> => {
    const res = await fetch(`${BASE_URL}/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error('Durum güncellenemedi.');
    return res.json();
  }
};
