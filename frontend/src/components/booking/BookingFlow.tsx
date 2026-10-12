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
  `w-full px-4 py-3.5 rounded-2xl bg-white text-[15px] placeholder:text-ink/30 outline-none transition ring-1 ${
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
  <div className="flex items-center gap-3 mb-5">
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
    <div className="relative bg-ultra-600 text-white rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-20px_rgb(58_56_240/0.6)]">
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-ultra-400/50 blur-3xl" />
      <div className="relative p-7">
        <p className="text-sm text-white/70">{done ? 'Randevun hazır' : 'Randevun'}</p>

        <div className="mt-5 flex items-center gap-3 min-h-[3rem]">
          {specialist ? (
            <>
              <span className="w-12 h-12 rounded-full bg-lime text-ink grid place-items-center font-display font-extrabold">
                {initials(specialist)}
              </span>
              <div>
                <div className="font-semibold leading-tight">{specialist.firstName} {specialist.lastName}</div>
                <div className="text-sm text-white/70">{specialist.title}</div>
              </div>
            </>
          ) : (
            <span className="text-white/60 text-sm">Uzman seçilmedi</span>
          )}
        </div>

        <div className="mt-7 flex items-end gap-4">
          <div className="font-display font-extrabold text-8xl leading-[0.8] tracking-tighter">{dayNum}</div>
          <div className="pb-1 capitalize">
            <div className="font-semibold text-lg leading-tight">{monthShort}</div>
            <div className="text-white/70 text-sm">{weekday}</div>
          </div>
        </div>
      </div>

      <div className="relative h-6">
        <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-mist" />
        <span className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-mist" />
        <div className="absolute inset-x-6 top-3 border-t-2 border-dashed border-white/25" />
      </div>

      <div className="relative p-7 pt-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-white/70">Saat</div>
          <div
            key={successData ? successData.startTime : selectedSlot ?? 'none'}
            className="font-display font-extrabold text-5xl tracking-tight tabular-nums animate-pop"
          >
            {done
              ? successData.startTime.substring(0, 5)
              : selectedSlot
              ? selectedSlot.substring(0, 5)
              : '––:––'}
          </div>
        </div>
        {done && (
          <span className="px-3 py-1.5 rounded-full bg-lime text-ink text-xs font-bold">
            {STATUS_TR[successData.status] ?? successData.status}
          </span>
        )}
      </div>
    </div>
  );

  if (successData) {
    return (
      <div className="max-w-md mx-auto mt-8 animate-rise">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-lime grid place-items-center mx-auto mb-5 animate-pop">
            <Check className="w-8 h-8" strokeWidth={3} />
          </div>
          <h1 className="font-display font-extrabold text-4xl tracking-tight">Randevun alındı</h1>
          <p className="text-ink/60 mt-3">
            {successData.customerFullName}, talebin kaydedildi. Onaylandığında sana bildireceğiz.
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
          className="mt-6 w-full py-4 bg-ink text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-ink/90 transition"
        >
          <CalendarPlus className="w-4 h-4" /> Yeni randevu planla
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-rise">
      <div className="max-w-2xl mb-10 mt-4">
        <h1 className="font-display font-extrabold text-5xl md:text-6xl tracking-tighter leading-[0.95]">
          Uzmanını seç, saatini al.
        </h1>
        <p className="text-ink/60 mt-4 text-lg">Dört kısa adımda randevun hazır.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 ring-1 ring-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
        <form onSubmit={handleSubmit} className="space-y-12 order-2 lg:order-1">
          <section>
            <StepTitle n={1} done={!!specialist}>Uzmanını seç</StepTitle>
            {loadingSpecialists ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="h-24 rounded-3xl bg-white/70 animate-pulse" />
                <div className="h-24 rounded-3xl bg-white/70 animate-pulse" />
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
                      aria-pressed={active}
                      className={`flex items-center gap-4 p-4 text-left rounded-3xl transition-all ${
                        active
                          ? 'bg-ink text-white shadow-xl shadow-ink/20 -translate-y-0.5'
                          : 'bg-white ring-1 ring-ink/5 hover:ring-ink/20'
                      }`}
                    >
                      <span
                        className={`w-14 h-14 rounded-2xl grid place-items-center font-display font-extrabold text-lg shrink-0 ${
                          active ? 'bg-lime text-ink' : 'bg-ultra-50 text-ultra-600'
                        }`}
                      >
                        {initials(s)}
                      </span>
                      <span>
                        <span className="block font-semibold">{s.firstName} {s.lastName}</span>
                        <span className={`block text-sm ${active ? 'text-white/60' : 'text-ink/50'}`}>{s.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <StepTitle n={2} done={!!selectedDate}>Günü seç</StepTitle>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
              {days.map(d => {
                const iso = toISO(d);
                const active = iso === selectedDate;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedDate(iso)}
                    aria-pressed={active}
                    className={`snap-start shrink-0 w-[4.5rem] py-3 rounded-2xl text-center transition-all ${
                      active ? 'bg-ultra-600 text-white shadow-lg shadow-ultra-600/30' : 'bg-white ring-1 ring-ink/5 hover:ring-ink/20'
                    }`}
                  >
                    <div className={`text-xs capitalize ${active ? 'text-white/70' : 'text-ink/50'}`}>
                      {d.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </div>
                    <div className="font-display font-extrabold text-2xl leading-tight mt-0.5">{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-ink/60 mt-1">
              Başka bir gün:
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
                className="bg-white rounded-xl px-3 py-1.5 ring-1 ring-ink/10 text-ink outline-none focus:ring-2 focus:ring-ultra-500"
              />
            </label>
          </section>

          <section>
            <StepTitle n={3} done={!!selectedSlot}>Saatini seç</StepTitle>
            {loadingSlots ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-12 rounded-2xl bg-white/70 animate-pulse" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white ring-1 ring-ink/5 text-ink/60 text-sm">
                Bu günde boş saat yok. Üstteki şeritten başka bir gün seçebilirsin.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {availableSlots.map(slot => {
                  const active = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      aria-pressed={active}
                      className={`h-12 rounded-2xl font-semibold tabular-nums transition-all ${
                        active
                          ? 'bg-lime text-ink scale-105 shadow-lg shadow-lime/60'
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
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Adın" error={touched.firstName ? errors.firstName : ''}>
                <input
                  type="text"
                  autoComplete="given-name"
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
                  autoComplete="family-name"
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
                  autoComplete="email"
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
                  autoComplete="tel"
                  placeholder="05XXXXXXXXX"
                  value={form.phone}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={inputCls(touched.phone && !!errors.phone)}
                />
              </Field>
              <Field label="Not (isteğe bağlı)" className="sm:col-span-2">
                <textarea
                  rows={3}
                  placeholder="Görüşme konusunu kısaca yazabilirsin"
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
              className={`group w-full py-5 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isFormValid && !submitting
                  ? 'bg-ultra-600 text-white hover:bg-ultra-700 shadow-xl shadow-ultra-600/30 hover:-translate-y-0.5'
                  : 'bg-ink/10 text-ink/30 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Randevu oluşturuluyor
                </>
              ) : (
                <>
                  Randevuyu oluştur
                  <ArrowRight className="w-5 h-5 transition-transform group-enabled:group-hover:translate-x-1" />
                </>
              )}
            </button>
            {!isFormValid && (
              <p className="text-center text-sm text-ink/40 mt-3">
                Uzman, saat ve tüm zorunlu alanlar tamamlanınca buton aktif olur.
              </p>
            )}
          </div>
        </form>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-28">
          {renderTicket()}
        </aside>
      </div>
    </div>
  );
};
