import React, { useState, useEffect, useMemo } from 'react';
import type { Specialist } from '../../types';
import { api } from '../../api/client';
import { Check, AlertCircle, ArrowRight, CalendarPlus } from 'lucide-react';

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (iso: string) => new Date(iso + 'T00:00:00');

const STATUS_TR: Record<string, string> = {
  PENDING: 'Onay bekliyor',
  CONFIRMED: 'Onaylandı',
  CANCELLED: 'İptal edildi',
  COMPLETED: 'Tamamlandı'
};

const initials = (s: { firstName: string; lastName: string }) =>
  `${s.firstName[0] ?? ''}${s.lastName[0] ?? ''}`;

const inputCls = (bad: boolean) =>
  `w-full px-4 py-3 rounded-2xl bg-white text-[15px] placeholder:text-ink/30 outline-none transition ring-1 ${
    bad ? 'ring-rose-400 bg-rose-50/40' : 'ring-ink/10 hover:ring-ink/20 focus:ring-2 focus:ring-ultra-500'
  }`;

const Field: React.FC<{
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, error, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="block text-sm font-medium text-ink/70 mb-1.5">{label}</span>
    {children}
    {error && <span className="block text-xs text-rose-600 mt-1.5">{error}</span>}
  </label>
);

const StepTitle: React.FC<{ n: number; done: boolean; children: React.ReactNode }> = ({ n, done, children }) => (
  <div className="flex items-center gap-3 mb-4">
    <span
      className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold transition-colors ${
        done ? 'bg-lime text-ink' : 'bg-ink text-white'
      }`}
    >
      {done ? <Check className="w-4 h-4" strokeWidth={3} /> : n}
    </span>
    <h2 className="font-display font-bold text-xl tracking-tight">{children}</h2>
  </div>
);

export const BookingFlow: React.FC = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
  const [touched, setTouched] = useState({ firstName: false, lastName: false, email: false, phone: false });

  const [loadingSpecialists, setLoadingSpecialists] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const days = useMemo(() => {
    const start = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const loadSpecialists = () => {
    setLoadingSpecialists(true);
    setErrorMsg(null);
    api.getSpecialists()
      .then(data => {
        setSpecialists(data);
        if (data.length > 0) setSelectedSpecialist(data[0].id);
      })
      .catch(err => setErrorMsg(err.message))
      .finally(() => setLoadingSpecialists(false));
  };

  useEffect(() => {
    loadSpecialists();
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
    email: !emailRegex.test(form.email.trim()) ? 'Geçerli bir e-posta giriniz.' : '',
    phone: !phoneRegex.test(form.phone.trim().replace(/\s+/g, '')) ? 'Telefon: 05XXXXXXXXX' : ''
  };

  const isFormValid =
    !errors.firstName && !errors.lastName && !errors.email && !errors.phone &&
    form.firstName.trim() !== '' && form.lastName.trim() !== '' &&
    selectedSpecialist !== null && selectedSlot !== null;

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

  const specialist = specialists.find(s => s.id === selectedSpecialist) ?? null;
  const dateObj = parse(selectedDate);
  const dayNum = dateObj.getDate();
  const monthShort = dateObj.toLocaleDateString('tr-TR', { month: 'long' });
  const weekday = dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });

  const renderTicket = (done = false) => (
    <div className="w-full max-w-[340px] mx-auto bg-ultra-600 text-white rounded-[2rem] overflow-hidden shadow-2xl relative">
      <div className="absolute -top-20 -right-12 w-48 h-48 rounded-full bg-ultra-400/40 blur-2xl" />
      <div className="relative p-6">
        <p className="text-xs text-white/70 tracking-wide uppercase font-semibold">{done ? 'Randevun hazır' : 'Randevu Özeti'}</p>

        <div className="mt-4 flex items-center gap-3">
          {specialist ? (
            <>
              <span className="w-11 h-11 rounded-full bg-lime text-ink grid place-items-center font-display font-bold text-sm shrink-0">
                {initials(specialist)}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{specialist.firstName} {specialist.lastName}</div>
                <div className="text-xs text-white/70 truncate">{specialist.title}</div>
              </div>
            </>
          ) : (
            <span className="text-white/60 text-sm">Uzman seçilmedi</span>
          )}
        </div>

        <div className="mt-6 flex items-end gap-3">
          <div className="font-display font-extrabold text-7xl leading-none tracking-tighter">{dayNum}</div>
          <div className="pb-1 capitalize">
            <div className="font-semibold text-base leading-tight">{monthShort}</div>
            <div className="text-white/70 text-xs">{weekday}</div>
          </div>
        </div>
      </div>

      <div className="relative h-6">
        <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-mist" />
        <span className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-mist" />
        <div className="absolute inset-x-6 top-3 border-t-2 border-dashed border-white/20" />
      </div>

      <div className="relative p-6 pt-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/70 font-medium">Saat Dilimi</div>
          <div className="font-display font-extrabold text-4xl tracking-tight mt-0.5">
            {done ? successData.startTime.substring(0, 5) : selectedSlot ? selectedSlot.substring(0, 5) : '––:––'}
          </div>
        </div>
        {done && (
          <span className="px-3 py-1 rounded-full bg-lime text-ink text-xs font-bold">
            {STATUS_TR[successData.status] ?? successData.status}
          </span>
        )}
      </div>
    </div>
  );

  if (successData) {
    return (
      <div className="max-w-md mx-auto mt-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-lime grid place-items-center mx-auto mb-3">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h1 className="font-display font-extrabold text-3xl">Randevun Alındı</h1>
          <p className="text-ink/60 text-sm mt-1">
            {successData.customerFullName}, randevu kaydın başarıyla oluşturuldu.
          </p>
        </div>

        {renderTicket(true)}

        <button
          onClick={() => {
            setSuccessData(null);
            setSelectedSlot(null);
            setForm({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
            setTouched({ firstName: false, lastName: false, email: false, phone: false });
          }}
          className="mt-6 w-full max-w-[340px] mx-auto py-3.5 bg-ink text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-ink/90 transition"
        >
          <CalendarPlus className="w-4 h-4" /> Yeni randevu planla
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-2">
      <div className="mb-6 mt-2">
        <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">
          Uzmanını seç, saatini al.
        </h1>
        <p className="text-ink/60 mt-1.5 text-base">Dört kısa adımda randevun hazır.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 ring-1 ring-rose-200 text-rose-700 rounded-2xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Backend bağlantısı kurulamadı: <strong>{errorMsg}</strong></span>
          </div>
          <button
            onClick={loadSpecialists}
            className="px-3 py-1 bg-white ring-1 ring-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-100"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Grid: Sol taraf form (flex-1), Sağ taraf bilet (shrink-0) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <StepTitle n={1} done={!!specialist}>Uzmanını seç</StepTitle>
            {loadingSpecialists ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="h-20 rounded-2xl bg-white/70 animate-pulse" />
                <div className="h-20 rounded-2xl bg-white/70 animate-pulse" />
              </div>
            ) : specialists.length === 0 ? (
              <div className="p-4 bg-white rounded-2xl ring-1 ring-ink/5 text-sm text-ink/60">
                Henüz kayıtlı uzman bulunamadı. Backend servisinizin çalıştığından emin olun.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {specialists.map(s => {
                  const active = selectedSpecialist === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSpecialist(s.id)}
                      className={`flex items-center gap-3 p-3.5 text-left rounded-2xl transition-all ${
                        active
                          ? 'bg-ink text-white shadow-lg'
                          : 'bg-white ring-1 ring-ink/5 hover:ring-ink/20'
                      }`}
                    >
                      <span
                        className={`w-11 h-11 rounded-xl grid place-items-center font-display font-extrabold text-sm shrink-0 ${
                          active ? 'bg-lime text-ink' : 'bg-ultra-50 text-ultra-600'
                        }`}
                      >
                        {initials(s)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-sm truncate">{s.firstName} {s.lastName}</span>
                        <span className={`block text-xs truncate ${active ? 'text-white/60' : 'text-ink/50'}`}>{s.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <StepTitle n={2} done={!!selectedDate}>Günü seç</StepTitle>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {days.map(d => {
                const iso = toISO(d);
                const active = iso === selectedDate;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedDate(iso)}
                    className={`shrink-0 w-16 py-2.5 rounded-xl text-center transition-all ${
                      active ? 'bg-ultra-600 text-white shadow-md' : 'bg-white ring-1 ring-ink/5 hover:ring-ink/20'
                    }`}
                  >
                    <div className={`text-[11px] capitalize ${active ? 'text-white/70' : 'text-ink/50'}`}>
                      {d.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </div>
                    <div className="font-display font-bold text-xl mt-0.5">{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <StepTitle n={3} done={!!selectedSlot}>Saatini seç</StepTitle>
            {loadingSlots ? (
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-white/70 animate-pulse" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-4 rounded-xl bg-white ring-1 ring-ink/5 text-ink/60 text-sm">
                Bu günde uygun randevu saati bulunmuyor.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => {
                  const active = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`h-10 rounded-xl font-semibold text-sm transition-all ${
                        active
                          ? 'bg-lime text-ink shadow-md scale-105'
                          : 'bg-white ring-1 ring-ink/5 hover:ring-ink/25 text-ink/80'
                      }`}
                    >
                      {slot.substring(0, 5)}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <StepTitle n={4} done={isFormValid}>Bilgilerin</StepTitle>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <Field label="Adın" error={touched.firstName ? errors.firstName : ''}>
                <input
                  type="text"
                  placeholder="Ahmet"
                  value={form.firstName}
                  onBlur={() => setTouched({ ...touched, firstName: true })}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className={inputCls(touched.firstName && !!errors.firstName)}
                />
              </Field>
              <Field label="Soyadın" error={touched.lastName ? errors.lastName : ''}>
                <input
                  type="text"
                  placeholder="Yılmaz"
                  value={form.lastName}
                  onBlur={() => setTouched({ ...touched, lastName: true })}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className={inputCls(touched.lastName && !!errors.lastName)}
                />
              </Field>
              <Field label="E-posta" error={touched.email ? errors.email : ''}>
                <input
                  type="email"
                  placeholder="ornek@alanadi.com"
                  value={form.email}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inputCls(touched.email && !!errors.email)}
                />
              </Field>
              <Field label="Telefon" error={touched.phone ? errors.phone : ''}>
                <input
                  type="tel"
                  placeholder="05XXXXXXXXX"
                  value={form.phone}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={inputCls(touched.phone && !!errors.phone)}
                />
              </Field>
              <Field label="Not (isteğe bağlı)" className="sm:col-span-2">
                <textarea
                  rows={2}
                  placeholder="Görüşme konusu veya notunuz..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className={`${inputCls(false)} resize-none`}
                />
              </Field>
            </div>
          </section>

          <div>
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full py-4 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
                isFormValid && !submitting
                  ? 'bg-ultra-600 text-white hover:bg-ultra-700 shadow-xl'
                  : 'bg-ink/10 text-ink/30 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Randevu oluşturuluyor...' : (
                <>Randevuyu Tamamla <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>

        {/* Sağ Sütun: Bilet */}
        <aside className="sticky top-24 hidden lg:block">
          {renderTicket()}
        </aside>
      </div>
    </div>
  );
};
