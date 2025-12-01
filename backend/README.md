# Hawkins Homestay Backend API

A complete MERN stack backend for Hawkins Homestay booking system.

## Features

- User Authentication (Register/Login with JWT)
- Booking Management
- Razorpay Payment Integration
- Admin Panel with Image Upload (Cloudinary)
- Email Notifications
- User Profile Management
- Package & Activity Management

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:3000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### User
- `GET /api/user/profile` - Get user profile (Protected)
- `PUT /api/user/profile` - Update user profile (Protected)
- `GET /api/user/bookings` - Get user bookings (Protected)
- `GET /api/user/bookings/:id` - Get single booking (Protected)
- `GET /api/user/payments` - Get user payments (Protected)

### Bookings
- `POST /api/bookings` - Create a new booking (Protected)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)

### Payments
- `POST /api/payments/create-order` - Create Razorpay order (Protected)
- `POST /api/payments/verify` - Verify payment (Protected)
- `GET /api/payments/:id` - Get payment details (Protected)

### Packages
- `GET /api/packages` - Get all packages (Public)
- `GET /api/packages/:id` - Get single package (Public)

### Activities
- `GET /api/activities` - Get all activities (Public)
- `GET /api/activities/:id` - Get single activity (Public)

### Admin (Protected - Admin only)
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `POST /api/admin/packages` - Create package (with image upload)
- `PUT /api/admin/packages/:id` - Update package (with image upload)
- `DELETE /api/admin/packages/:id` - Delete package
- `POST /api/admin/activities` - Create activity (with image upload)
- `PUT /api/admin/activities/:id` - Update activity (with image upload)
- `DELETE /api/admin/activities/:id` - Delete activity
- `GET /api/admin/users` - Get all users
- `GET /api/admin/payments` - Get all payments

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Razorpay for payments
- Cloudinary for image storage
- Nodemailer for emails
- Multer for file uploads

