import React, { useState, useEffect } from 'react';
import type { Specialist } from '../../types';
import { api } from '../../api/client';
import { Calendar, Clock, CheckCircle2, AlertCircle, User, ArrowRight, Mail, Phone, Sparkles } from 'lucide-react';

export const BookingFlow: React.FC = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false
  });

  const [loadingSpecialists, setLoadingSpecialists] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    setLoadingSpecialists(true);
    api.getSpecialists()
      .then(data => {
        setSpecialists(data);
        if (data.length > 0) setSelectedSpecialist(data[0].id);
      })
      .catch(err => setErrorMsg(err.message))
      .finally(() => setLoadingSpecialists(false));
  }, []);

  useEffect(() => {
    if (selectedSpecialist && selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setErrorMsg(null);
      api.getAvailableSlots(selectedSpecialist, selectedDate)
        .then(slots => setAvailableSlots(slots))
        .catch(err => setErrorMsg(err.message))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedSpecialist, selectedDate]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(05|5)[0-9]{9}$/;

  const errors = {
    firstName: form.firstName.trim().length < 2 ? 'Ad en az 2 karakter olmalıdır.' : '',
    lastName: form.lastName.trim().length < 2 ? 'Soyad en az 2 karakter olmalıdır.' : '',
    email: !emailRegex.test(form.email.trim()) ? 'Geçerli bir e-posta adresi giriniz (örn: ad@ornek.com).' : '',
    phone: !phoneRegex.test(form.phone.trim().replace(/\s+/g, '')) ? 'Telefon formatı: 05XXXXXXXXX veya 5XXXXXXXXX' : ''
  };

  const isFormValid =
    !errors.firstName &&
    !errors.lastName &&
    !errors.email &&
    !errors.phone &&
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    selectedSpecialist !== null &&
    selectedSlot !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, phone: true });

    if (!isFormValid || !selectedSpecialist || !selectedSlot) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await api.createAppointment({
        specialistId: selectedSpecialist,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        customerFirstName: form.firstName.trim(),
        customerLastName: form.lastName.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        notes: form.notes
      });
      setSuccessData(result);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Randevu Başarıyla Oluşturuldu</h2>
        <p className="text-slate-600 mt-2 text-sm">
          Sayın <strong>{successData.customerFullName}</strong>, rezervasyon kaydınız sistemimize işlendi.
        </p>

        <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-200/80 text-left text-sm space-y-2.5">
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span className="text-slate-500">Uzman:</span>
            <span className="font-semibold text-slate-800">{successData.specialistFullName} ({successData.specialistTitle})</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span className="text-slate-500">Tarih & Saat:</span>
            <span className="font-semibold text-slate-800">{successData.appointmentDate} • {successData.startTime.substring(0, 5)}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Durum:</span>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">
              {successData.status}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccessData(null);
            setSelectedSlot(null);
            setForm({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
            setTouched({ firstName: false, lastName: false, email: false, phone: false });
          }}
          className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
        >
          Yeni Randevu Planla
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
      <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Online Randevu Talebi <Sparkles className="w-5 h-5 text-blue-500" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">Lütfen uzman, tarih ve seans saatini seçerek iletişim bilgilerinizi giriniz.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> 1. Uzman Seçin
          </label>
          {loadingSpecialists ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialists.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSpecialist(s.id)}
                  className={`p-4 text-left rounded-xl border transition-all ${
                    selectedSpecialist === s.id
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{s.firstName} {s.lastName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> 2. Randevu Tarihi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> 3. Boş Zaman Dilimi
            </label>
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-9 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-xs text-amber-700 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                Bu tarihte uygun slot bulunmamaktadır.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      selectedSlot === slot
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-white'
                    }`}
                  >
                    {slot.substring(0, 5)}
                  </button>
                ))}
              </div>
            )}
            {!selectedSlot && availableSlots.length > 0 && (
              <p className="text-xs text-slate-400 mt-2 font-medium">Seans saatini seçiniz.</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">4. İletişim Bilgileriniz</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Adınız *</label>
              <input
                type="text"
                placeholder="Örn: Ahmet"
                value={form.firstName}
                onBlur={() => setTouched({ ...touched, firstName: true })}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                  touched.firstName && errors.firstName
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.firstName && errors.firstName && (
                <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Soyadınız *</label>
              <input
                type="text"
                placeholder="Örn: Yılmaz"
                value={form.lastName}
                onBlur={() => setTouched({ ...touched, lastName: true })}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                  touched.lastName && errors.lastName
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.lastName && errors.lastName && (
                <p className="text-xs text-rose-600 mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> E-posta Adresiniz *
              </label>
              <input
                type="email"
                placeholder="ornek@alanadi.com"
                value={form.email}
                onBlur={() => setTouched({ ...touched, email: true })}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                  touched.email && errors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Telefon Numaranız *
              </label>
              <input
                type="tel"
                placeholder="05XXXXXXXXX"
                value={form.phone}
                onBlur={() => setTouched({ ...touched, phone: true })}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                  touched.phone && errors.phone
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {touched.phone && errors.phone && (
                <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Görüşme Notu (Opsiyonel)</label>
              <textarea
                placeholder="Görüşme konusu veya kısa açıklama..."
                rows={2}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition duration-200 shadow-sm ${
              isFormValid && !submitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                İşlem Yapılıyor...
              </span>
            ) : (
              <>
                Randevuyu Onayla ve Oluştur <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          {!isFormValid && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Lütfen uzmanı ve saati seçip zorunlu alanları eksiksiz doldurunuz.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
