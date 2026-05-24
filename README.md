# 🎯 Smart Offer Slot Booking System

A full-stack hackathon project — React + .NET 8 + Supabase (PostgreSQL).

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- A free [Supabase](https://supabase.com) account

---

## 1️⃣ Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database**
3. Copy your **connection string** — it looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

---

## 2️⃣ Backend Setup (.NET 8)

```bash
cd backend/SmartOffer.Api
```

### Configure `appsettings.json`

Open `appsettings.json` and replace the placeholders:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.YOUR_PROJECT_REF.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  },
  "JwtSettings": {
    "SecretKey": "ANY_RANDOM_STRING_AT_LEAST_32_CHARS_LONG!!",
    "Issuer": "SmartOfferApi",
    "Audience": "SmartOfferClient",
    "ExpiryInHours": 24
  }
}
```

### Run EF Core Migrations

```bash
# Install EF Core CLI if not installed
dotnet tool install --global dotnet-ef

# Create and apply the initial migration
dotnet ef migrations add InitialCreate
dotnet ef database update
```

This will automatically create all tables in your Supabase PostgreSQL database and seed an admin user.

### Start the API

```bash
dotnet run
```

API will be available at: **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**

---

## 3️⃣ Frontend Setup (React + Vite)

```bash
cd frontend
```

### Configure `.env`

```env
VITE_API_URL=http://localhost:5000
```

### Install & Run

```bash
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🔑 Default Admin Credentials

| Field    | Value                   |
|----------|-------------------------|
| Email    | admin@smartoffer.com    |
| Password | Admin@123               |

---

## 📋 Available Screens

| Screen              | Route                      | Access  |
|---------------------|----------------------------|---------|
| Public Offer List   | `/`                        | Public  |
| Booking Flow        | `/offers/:id/book`         | Public  |
| Admin Login         | `/admin/login`             | Public  |
| Admin Dashboard     | `/admin/dashboard`         | Admin   |
| Create Offer        | `/admin/offers/create`     | Admin   |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | `/api/auth/login`  | Admin login → JWT  |

### Business
| Method | Endpoint              | Auth     |
|--------|------------------------|----------|
| GET    | `/api/business`        | Public   |
| POST   | `/api/business`        | Admin    |
| PUT    | `/api/business/{id}`   | Admin    |
| DELETE | `/api/business/{id}`   | Admin    |

### Offers
| Method | Endpoint              | Auth     | Notes                          |
|--------|-----------------------|----------|--------------------------------|
| GET    | `/api/offers`         | Public   | Active offers only; filterable |
| GET    | `/api/offers/all`     | Admin    | All statuses                   |
| GET    | `/api/offers/{id}`    | Public   | Hides cancelled/expired        |
| POST   | `/api/offers`         | Admin    | Validates offer < original price |
| PUT    | `/api/offers/{id}`    | Admin    |                                |
| DELETE | `/api/offers/{id}`    | Admin    | Soft-deletes (sets Cancelled)  |

### Slots
| Method | Endpoint                      | Auth    |
|--------|-------------------------------|---------|
| GET    | `/api/slots`                  | Admin   |
| GET    | `/api/offers/{offerId}/slots` | Public  |
| POST   | `/api/slots`                  | Admin   |
| PUT    | `/api/slots/{id}`             | Admin   |
| DELETE | `/api/slots/{id}`             | Admin   |

### Bookings
| Method | Endpoint                         | Auth     | Notes                        |
|--------|----------------------------------|----------|------------------------------|
| GET    | `/api/bookings`                  | Admin    | All bookings                 |
| GET    | `/api/bookings/{id}`             | Public   |                              |
| GET    | `/api/bookings/reference/{ref}`  | Public   | Lookup by reference          |
| POST   | `/api/bookings`                  | Public   | Validates capacity; unique ref |
| PUT    | `/api/bookings/{id}/status`      | Admin    | Frees capacity if cancelled  |

### Dashboard
| Method | Endpoint                  | Auth  |
|--------|---------------------------|-------|
| GET    | `/api/dashboard/summary`  | Admin |

---

## 🏗️ Project Structure

```
.
├── backend/
│   └── SmartOffer.Api/
│       ├── Controllers/    # Auth, Business, Offers, Slots, Bookings, Dashboard
│       ├── Data/           # AppDbContext (EF Core + Npgsql)
│       ├── Models/         # User, Business, Offer, OfferSlot, Booking
│       ├── DTOs/           # Request/Response transfer objects
│       ├── Program.cs      # App setup, JWT, Swagger, CORS
│       └── appsettings.json
└── frontend/
    └── src/
        ├── api/            # Axios client, auth, offers
        ├── components/     # Navbar, OfferCard, StatusBadge
        ├── pages/
        │   ├── admin/      # AdminLogin, AdminDashboard, CreateOffer
        │   └── public/     # PublicOfferList, BookingFlow
        └── types/          # TypeScript interfaces
```

---

## ✅ Business Logic Highlights

- **Offer price validation**: API rejects any offer where `offerPrice >= originalPrice`
- **Capacity enforcement**: Booking fails if `bookedCount + peopleCount > capacity`
- **Unique booking references**: Format `SOB-XXXXXXXX`, collision-retry loop
- **Slot auto-updates**: Slot status → `Full` when fully booked; reverts if booking is cancelled
- **Public endpoint safety**: Cancelled/Expired offers are hidden from unauthenticated users
- **JWT authentication**: All admin routes protected with Bearer token

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18 + TypeScript + Tailwind CSS    |
| Bundler    | Vite 5                                  |
| Routing    | React Router v6                         |
| HTTP       | Axios                                   |
| Backend    | .NET 8 Web API                          |
| ORM        | Entity Framework Core 8                 |
| Database   | Supabase (PostgreSQL via Npgsql)        |
| Auth       | JWT Bearer (BCrypt password hashing)    |
| API Docs   | Swagger / OpenAPI                       |
