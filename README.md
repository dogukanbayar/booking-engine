# BookingEngine

Uzmanlar için randevu oluşturma ve günlük rezervasyonları yönetme olanağı sunan full-stack bir randevu uygulamasıdır. Müşteriler uzman, tarih ve uygun saat seçerek randevu talebi oluşturabilir; yönetici panelinden randevular görüntülenip durumları güncellenebilir.

## Özeti

BookingEngine, Spring Boot tabanlı bir backend ve React + Vite tabanlı bir frontend içerir. Sistem:

- uzman listesi sunar
- belirli bir uzman için uygun saatleri hesaplar
- randevu oluşturur
- aynı uzman için aynı saat tekrar rezervasyonu engeller
- yönetici panelinde randevuları listeler
- randevu durumunu onay / iptal / tamamlandı olarak günceller

## Teknoloji Yığını

### Backend
- Java 17
- Spring Boot 3.3.4
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL 16
- SLF4J / Logback
- Lombok

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS (proje kapsamında tanımlı, stiller hazırlanmış)
- Lucide React ikonları

## Uygulama Özellikleri

### Müşteri tarafı
- Uzman seçimi
- Tarih seçimi
- Boş saat dilimi listelenmesi
- Müşteri bilgileri (ad, soyad, e-posta, telefon)
- Not alanı
- Randevu oluşturma
- Aynı saat rezervasyonunu engelleme

### Yönetici tarafı
- Günlük randevu görünümü
- Uzman bazlı filtreleme
- Randevu durum güncelleme
- Durumlar:
  - PENDING
  - CONFIRMED
  - CANCELLED
  - COMPLETED

## Proje Yapısı

```text
booking-engine/
├── docker-compose.yml
├── pom.xml
├── mvnw
├── mvnw.cmd
├── README.md
├── src/
│   ├── main/
│   │   ├── java/com/bookingengine/backend/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── enums/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/bookingengine/backend/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig*.json
└── target/
```

## Ön Koşullar

Kurulum öncesinde aşağıdakilerin sisteminizde kurulu olması gerekir:

- Java 17+
- Maven veya Maven Wrapper (`./mvnw` kullanabilirsiniz)
- Node.js 18+
- npm
- Docker ve Docker Compose

## Kurulum

### 1) Veritabanını Başlat

Projede PostgreSQL için Docker Compose dosyası hazırdır.

```bash
docker compose up -d
```

Bu komut arka planda PostgreSQL'i başlatır. Varsayılan bağlantı bilgileri:

- Host: `localhost`
- Port: `5433`
- Database: `booking_db`
- Kullanıcı: `postgres`
- Şifre: `postgrespassword`

### 2) Backend'i Çalıştır

Proje kök dizinindeyken:

```bash
./mvnw spring-boot:run
```

Backend varsayılan olarak şu adreste çalışır:

- `http://localhost:8080`

### 3) Frontend'i Çalıştır

Yeni bir terminal açıp:

```bash
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak şu adreste açılır:

- `http://localhost:5173`

## Konfigürasyon

Backend ayarları `src/main/resources/application.yml` dosyasında yer alır.

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/booking_db
    username: postgres
    password: postgrespassword
```

Uygulama JPA ile otomatik tablo oluşturma yapacak şekilde ayarlanmıştır (`ddl-auto: update`). Bu nedenle ilk çalıştırmada veritabanı şeması kendiliğinden oluşur.

## API Endpoint'leri

### Uzmanlar

```http
GET /api/v1/specialists
```
Tüm aktif uzmanları listeler.

```http
GET /api/v1/specialists/{id}/available-slots?date=YYYY-MM-DD
```
Belirli uzman için seçilen tarihe göre müsait saatleri döndürür.

### Randevular

```http
POST /api/v1/appointments
```
Yeni randevu oluşturur.

Body örneği:

```json
{
  "specialistId": 1,
  "customerFirstName": "Ayşe",
  "customerLastName": "Yılmaz",
  "customerEmail": "ayse@example.com",
  "customerPhone": "05551234567",
  "appointmentDate": "2026-10-15",
  "startTime": "10:30",
  "notes": "İlk muayene randevusu"
}
```

```http
GET /api/v1/appointments/{id}
```
Tek bir randevuyu getirir.

### Yönetici API

```http
GET /api/v1/admin/appointments?date=YYYY-MM-DD&specialistId=1
```
Belirli tarihe göre randevuları listeler.

```http
PATCH /api/v1/admin/appointments/{id}/status
```
Randevu durumunu günceller.

Body örneği:

```json
{
  "status": "CONFIRMED"
}
```

## Randevu Akışı

1. Kullanıcı uzman seçer.
2. Tarih seçer.
3. Backend müsait saatleri hesaplar.
4. Kullanıcı müşteri bilgilerini doldurur.
5. Randevu oluşturulur.
6. Aynı uzman / aynı tarih / aynı saat için ikinci rezervasyon engellenir.
7. Yönetici panelinde randevu takibi yapılır.
8. Yönetici durum değiştirir: onayla, iptal et, tamamlandı.

## Veri Modelleri

### Specialist
- id
- firstName
- lastName
- title
- email
- isActive
- createdAt

### Customer
- id
- firstName
- lastName
- email
- phone

### Appointment
- id
- specialist
- customer
- appointmentDate
- startTime
- endTime
- status
- notes
- createdAt
- updatedAt

## Eşzamanlı Rezervasyonlar

Randevu oluşturulurken servis, uzman/tarih/saat kombinasyonunda iptal edilmemiş mevcut bir randevu olup olmadığını kontrol eder. Kayıt `saveAndFlush` ile veritabanına gönderilir; veritabanından bir bütünlük ihlali gelirse uygulama bunu `409 Conflict` yanıtına dönüştürür.

> **Veritabanı kısıtı hakkında:** Uygulama kodunda veritabanı bütünlük ihlallerini yakalayan akış bulunuyor; ancak bu repoda eşzamanlı istekleri veritabanı seviyesinde kesin olarak engelleyecek partial unique index oluşturan bir migration veya DDL bulunmuyor. Eşzamanlı double-booking korumasının veritabanı garantisi için bu kısıtın kullanılan veritabanında ayrıca tanımlanmış olması gerekir.

## Geliştirme Notları

- Backend ve frontend ayrı ayrı çalıştırılmaktadır.
- CORS ayarı frontend için `localhost:5173` olarak konfigüre edilmiştir.
- Uygulama, uygun saat kontrolü için 09:00 - 17:00 aralığını 30 dakikalık aralıklarla hesaplar.
- İptal edilen randevular uygun slot hesabında ve randevu oluşturma ön kontrolünde dolu kabul edilmez.
- Hata yanıtları uygulamaya özel JSON biçimindedir; RFC 7807 uyumluluğu varsayılmamalıdır.

## Sık Karşılaşılan Sorunlar

### Veritabanı bağlantısı kurulamadı
Docker konteynerini başlatmayı unutmayın:

```bash
docker compose up -d
```

### Frontend API isteği çalışmıyor
Backend'in `http://localhost:8080` üzerinde çalışıyor olduğundan emin olun.

### Port çakışması
Eğer 8080 veya 5433 portları kullanımda ise, ilgili port numaralarını config dosyalarında güncelleyin.

## Katkı Sağlama

Projeye katkı sağlamak isterseniz:

1. Forklayın
2. Yeni bir branch oluşturun
3. Değişikliklerinizi yapın
4. Pull request oluşturun
