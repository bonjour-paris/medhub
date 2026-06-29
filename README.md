# MedHub

MedHub is a full-stack MERN e-commerce platform connecting sellers, customers, and admins. Sellers manage products and orders, customers browse and purchase, and admins approve seller accounts.

## Tech Stack

**Backend** — Node.js, Express, MongoDB (Mongoose), JWT authentication, bcrypt password hashing, Multer for file uploads.

**Frontend** — React, TypeScript, Vite, React Hook Form, Zod schema validation, CSS Modules, Axios.

## Architecture

The backend follows an MVC structure:

```
server/src/
├── controllers/   # Request handlers (admin, auth, seller registration/approval)
├── models/        # Mongoose schemas (User, Product, Order)
├── routes/        # Express route definitions
├── middleware/     # JWT authentication & role-based authorization
├── utils/          # Token generation/verification, auth helpers
└── app.ts / server.ts
```

The frontend is organized by feature:

```
client/src/
├── api/            # Axios instance
├── components/     # Reusable form inputs (FormInput, FormSelect, ImageUpload)
├── pages/
│   ├── auth/       # Login, registration (admin/seller/customer), admin dashboard
│   └── Seller/     # Product & order management, seller dashboard
├── validation/     # Zod schemas
├── types/          # Shared TypeScript types
└── utils/          # Auth token helpers
```

Each component/page has a co-located `.module.css` file for scoped styling (CSS Modules) rather than global classes.

## Key Features

- **JWT-based authentication** with role-based access control (`seller`, `customer`, `admin`, with `superadmin`/`useradmin` sub-roles)
- **Schema validation** on the client via Zod (email format, password rules, confirm-password matching, file type checks) backed by server-side checks
- **Seller approval workflow** — new sellers register, admins approve or reject before they can log in
- **Product & order management** for sellers, including image uploads
- **Scoped component styling** via CSS Modules

## Getting Started

```bash
# install dependencies
npm install
cd client && npm install

# run the backend (from project root)
npm run dev

# run the frontend (from client/)
npm run start
```

Create a `.env` file in the project root with your MongoDB connection string and JWT secret (see `server/src/utils/jwt.ts` and `server/src/app.ts` for the expected variables).

## Status

Built as a final-year academic project. Core flows (registration, login, seller approval, product/order CRUD) are implemented; CSS Modules conversion completed for all client components and pages.
