# 🚀 Focus Pulse - Executive Workspace Entrance & Pomodoro Platform

**Focus Pulse** เป็นระบบบริหารจัดการเวลาทำงานสำหรับมืออาชีพ (Pomodoro Timer + Analytics + Video Relaxation System) พัฒนาด้วยสถาปัตยกรรมระดับองค์กร (Next.js 14, NestJS, Prisma ORM, Supabase Cloud PostgreSQL, Supabase Auth & Multi-Factor Authentication 2FA)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

- ⏱️ **Pomodoro Timer**: นาฬิกาจับเวลาโฟกัสปรับตั้งเวลาได้อิสระ พร้อมพิมพ์ตัวเลขเวลาเองได้ (Direct Typing Stepper)
- 📊 **Executive Dashboard**: สถิติผลงานรวม การ์ดสถานะทรงพาสเทล Soft Tint และหลอดเป้าหมายรายวัน
- 🎬 **Video Relaxation Library**: คลังวิดีโอพักสายตาและผ่อนคลาย เปิดเด้งให้อัตโนมัติเมื่อครบเวลาโฟกัส
- 🔐 **Supabase Auth & Security**: ระบบสมัครสมาชิก ล็อกอิน (Email & Password, Google OAuth, GitHub OAuth) และระบบความปลอดภัย 2 ชั้น (2FA / Google Authenticator)
- 🗄️ **Prisma ORM & PostgreSQL**: เชื่อมต่อฐานข้อมูล Supabase PostgreSQL ในการบันทึกประวัติและสถิติแบบเรียลไทม์

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: Next.js 14, React 18, TypeScript, Vanilla CSS Design System, Lucide Icons
- **Backend**: NestJS, TypeScript, Prisma ORM 5
- **Database & Auth**: Supabase Cloud PostgreSQL, Supabase Auth, TOTP 2FA

---
<img width="1893" height="663" alt="image" src="https://github.com/user-attachments/assets/fe0e6c1c-77dd-4a96-81b8-4231ba7595e8" />
<img width="1895" height="891" alt="image" src="https://github.com/user-attachments/assets/45be2149-7aff-42c0-8ab7-68598ee3c5f7" />
<img width="1911" height="911" alt="image" src="https://github.com/user-attachments/assets/40ec4db4-7c08-49e5-b89e-a748c11cfada" />
<img width="1903" height="912" alt="image" src="https://github.com/user-attachments/assets/6e25dc69-1fd1-434b-80c0-1c85192d49d0" />

---




## 🚀 วิธีการติดตั้งและเริ่มรันระบบ (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. กำหนดค่า Environment Variables
สร้างไฟล์ `.env` ใน `backend/` และ `.env.local` ใน `frontend/`

```env
# backend/.env
DATABASE_URL="postgresql://postgres.[YOUR-REF]:[YOUR-PASS]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-REF]:[YOUR-PASS]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### 3. รันระบบ
```bash
# รัน Backend (Port 3001)
cd backend
npm run start:dev

# รัน Frontend (Port 3000)
cd frontend
npm run dev
```

เปิดเบราว์เซอร์เข้าที่ `http://localhost:3000` ใช้งานได้ทันที!
