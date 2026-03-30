# FinFlow - Aplikasi Manajemen Keuangan Pribadi

Aplikasi web modern untuk mengelola keuangan pribadi Anda dengan mudah, dibangun dengan Next.js 15, React 19, dan Supabase.

## Fitur Utama

### 1. Autentikasi & Keamanan
- Registrasi dan login dengan email/password
- OAuth integration (Google)
- Session management yang aman
- Protected routes dengan middleware
- Password management di settings

### 2. Dashboard & Statistik
- Overview keuangan real-time (pemasukan, pengeluaran, saldo)
- Visualisasi data dengan pie chart pengeluaran per kategori
- Breakdown kategori dengan progress bar
- List transaksi terbaru
- Data update otomatis

### 3. Manajemen Transaksi
- Catat transaksi pemasukan dan pengeluaran
- Kategorisasi transaksi
- Filter by bulan, kategori
- Deskripsi dan tanggal kustom
- View lengkap dengan sorting

### 4. Manajemen Kategori
- Buat kategori custom untuk pemasukan dan pengeluaran
- Pilih warna untuk setiap kategori
- Tampilan terorganisir per tipe
- Edit dan hapus kategori

### 5. Budget Tracking
- Atur budget per kategori bulanan
- Real-time tracking pengeluaran vs budget
- Status warning jika budget terlampaui
- Progress bar visual
- Hitungan sisa budget

### 6. Laporan Keuangan
- Summary stats (pemasukan, pengeluaran, saldo)
- Riwayat transaksi lengkap per bulan
- Export ke CSV dan JSON
- Filter by bulan
- Analisis surplus/deficit

## Tech Stack

### Frontend
- **Framework**: Next.js 15 dengan App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Data Fetching**: SWR (stale-while-revalidate)
- **Charts**: Recharts
- **Icons**: Lucide React
- **TypeScript**: Type-safe development

### Backend & Database
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Security**: Row Level Security (RLS)

## Struktur Project

```
/app
  /auth
    /login          # Login page
    /register       # Register page
    /callback       # OAuth callback
  /api
    /categories     # Category CRUD
    /transactions   # Transaction CRUD
    /budgets        # Budget CRUD
    /dashboard
      /stats        # Dashboard statistics
    /reports
      /export       # Export CSV/JSON
  /dashboard        # Dashboard page
  /transactions     # Transactions page
  /categories       # Categories management
  /budgets          # Budget tracking
  /reports          # Financial reports
  /settings         # User settings
  layout.tsx
  page.tsx          # Landing page

/components
  /ui               # shadcn/ui components
  /shared
    Navbar.tsx      # Navigation bar
  TransactionForm.tsx
  CategoryForm.tsx
  BudgetForm.tsx

/lib
  /supabase
    client.ts       # Supabase client
    server.ts       # Supabase server
  /utils
    formatting.ts   # Currency & date formatting
  types.ts          # TypeScript interfaces

middleware.ts       # Protected routes
```

## Setup & Installation

### 1. Clone atau Download Project
```bash
git clone <repository-url>
cd finflow
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Supabase

**Kunjungi: https://supabase.com**

1. Buat project baru
2. Catat Project URL dan Anon Key
3. Jalankan SQL migration (lihat `SETUP.md` untuk script lengkap)
4. Enable RLS policies untuk keamanan data

### 4. Environment Variables
```bash
# Copy dari .env.example
cp .env.example .env.local

# Edit .env.local dengan Supabase keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Setup OAuth (Opsional)
Jika ingin menggunakan Google OAuth, ikuti steps di SETUP.md

### 6. Jalankan Development Server
```bash
pnpm dev
```
```bash
npm dev
```

Buka http://localhost:3000 di browser

## Default Categories

Aplikasi menggunakan kategori default:

**Pengeluaran:**
- Makanan
- Transportasi
- Hiburan
- Kesehatan
- Pendidikan
- Utilitas
- Belanja

**Pemasukan:**
- Gaji
- Bonus
- Bisnis
- Investasi

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Protected Routes**: Middleware checks authentication
- **Secure Session**: Supabase session management
- **Password Hashing**: Supabase Auth handles securely
- **CORS Configuration**: Safe API access

## Performance Optimizations

- SWR data fetching dengan caching
- Server Components untuk data fetching
- Lazy loading components
- Optimized images
- CSS-in-JS minification

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Mobile app dengan React Native
- Real-time notifications
- Recurring transactions
- Bill reminders
- Multi-user wallets
- Advanced analytics
- Dark mode improvements
- Multi-language support
