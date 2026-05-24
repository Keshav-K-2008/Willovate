# 🚀 Running the Smart Offer Slot Booking System (Arch Linux Guide)

This guide outlines the steps to install dependencies and run both the backend (.NET 8 Web API) and the frontend (React + Vite + TypeScript) applications on **Arch Linux**.

---

## 📋 Prerequisites & Installation (Arch Linux)

Before running the application, make sure you have the required packages installed from the official Arch repositories:

1. **Install Node.js & NPM**:
   ```bash
   sudo pacman -S nodejs npm
   ```

2. **Install ASP.NET Core Runtime (CRITICAL)**:
   By default, `dotnet-sdk` on Arch Linux does not install the ASP.NET Core runtime framework (`Microsoft.AspNetCore.App`), which is required to run web applications and APIs.

   To run using your existing **.NET 10** setup:
   ```bash
   sudo pacman -S aspnet-runtime
   ```

   *Alternatively, if you prefer to use the exact **.NET 8** SDK/runtime that the project targets:*
   ```bash
   sudo pacman -S dotnet-sdk-8.0 aspnet-runtime-8.0
   ```

---

## 🖥️ 1. Backend Setup & Run

The backend is configured to use a PostgreSQL database hosted on Supabase (configured in `appsettings.json`). Database migrations are automatically applied on startup, so there is no need to manually run database update commands.

1. Navigate to the backend project directory (from the workspace root):
   ```bash
   cd backend/SmartOffer.Api
   ```

2. Run the application:
   ```bash
   dotnet run
   ```
   *(Note: The project contains `<RollForward>Major</RollForward>` in `SmartOffer.Api.csproj`, which allows it to run seamlessly on your installed .NET 10 environment even though the project targets .NET 8).*

3. The API will start and be available at:
   - **Local Server**: `http://localhost:5000`
   - **Swagger OpenAPI Documentation**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

## 💻 2. Frontend Setup & Run

The frontend communicates with the backend API running at `http://localhost:5000` (configured via `frontend/.env`).

> [!IMPORTANT]
> Make sure you are in the correct `frontend` folder (`Willovate/frontend`) and **not** the deleted `smart-offer-booking/frontend` folder in any lingering terminal session.

1. Navigate to the frontend directory:
   ```bash
   cd ../../frontend
   ```

2. Install dependencies (Vite has been reverted to `5.4.21` to avoid peer dependency conflicts with the React plugin):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. The frontend will be available at:
   - **Local Web Server**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Admin Credentials

To log into the Admin Dashboard (`http://localhost:5173/admin/login`), use the following seeded credentials:

| Field    | Value |
|:---|:---|
| **Email** | `admin@smartoffer.com` |
| **Password** | `Admin@123` |

---

## 🛠️ Resolved Issues

During analysis, we resolved the following issues to make sure the project builds and runs correctly:

1. **Tailwind CSS Compilation Error**:
   - *Problem*: Vite build failed because the secondary button component applied `hover:border-dark-400` in `index.css`, but `dark-400` was not defined in the custom Tailwind colors.
   - *Solution*: Added the missing `400` shade (`#3e3e5c`) to the custom `dark` color palette inside `tailwind.config.js`.

2. **TypeScript Compilation Error**:
   - *Problem*: TypeScript complained that `Property 'env' does not exist on type 'ImportMeta'` in `src/api/client.ts`.
   - *Solution*: Created a `src/vite-env.d.ts` file containing `/// <reference types="vite/client" />` to properly load Vite's ambient type definitions.

3. **Vite Major Version Conflict**:
   - *Problem*: `npm audit fix --force` had upgraded Vite to `8.0.14`, causing peer dependency conflicts with the React compiler plugin.
   - *Solution*: Reverted Vite to `^5.4.21` in `package.json` so dependencies can install cleanly.

4. **PostgreSQL Connection String Format**:
   - *Problem*: Backend failed on startup with `System.ArgumentException: Format of the initialization string does not conform to specification` because `appsettings.json` was using a URI-style PostgreSQL connection string (`postgresql://...`).
   - *Solution*: Converted the connection string to the standard ADO.NET Npgsql key-value pair format (`Host=...;Port=...`).

5. **CORS / Preflight Redirect Blocker**:
   - *Problem*: The browser blocked requests to the API with a CORS policy violation because the API was redirecting HTTP traffic to HTTPS (due to `app.UseHttpsRedirection()`), which failed in local development.
   - *Solution*: Commented out `app.UseHttpsRedirection();` in `Program.cs` to serve requests entirely over HTTP locally.

6. **Missing Database Schema & Seed Data**:
   - *Problem*: Attempting to log in resulted in an HTTP 500 error because the `Users` relation (and other tables) did not exist in the database. `db.Database.Migrate()` was doing nothing because the project lacked migration files.
   - *Solution*: Used the `dotnet-ef` migrations tool to generate the initial migrations folder, allowing `db.Database.Migrate()` to correctly construct the database schema and seed the default admin account on startup.

7. **Object Cycle JSON Serialization Error (HTTP 500 on Offers)**:
   - *Problem*: Fetching offers caused a `System.Text.Json.JsonException: A possible object cycle was detected` due to mutual navigation properties between `Offer` and `Business` models, returning HTTP 500.
   - *Solution*: Configured `opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles` in `Program.cs` to prevent infinite serialization loops.
