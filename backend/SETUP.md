# Setup Guide for Hawkins Homestay Backend

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Razorpay account
- Gmail account with App Password enabled

## Staging verification

Serve the public site and API on the same HTTPS origin. Configure `PUBLIC_SITE_URL` with that origin, and use a staging database, Razorpay test keys and an email inbox you control. If the app is behind a reverse proxy, configure `TRUST_PROXY_HOPS` for the exact proxy topology so request limits use the correct client address. The in-process request limits apply per server instance.

1. Confirm `/api/health` returns 200 with MongoDB connected and 503 during a database outage.
2. Submit a contact inquiry and confirm receipt. Confirm the reply goes to the sender.
3. Register and verify a test account. Confirm incorrect codes are limited and redeemed codes cannot be reused.
4. Request and follow a password reset email. Confirm the link works once, the previous password and session stop working, and the new password works.
5. Create a booking for an active package and complete a Razorpay test payment. Confirm the booking, payment, profile history, admin dashboard and confirmation email refer to the same booking. Repeat for checkout dismissal and payment failure, then check cancellation and refund behavior against the property's policy.
6. Archive the package and confirm it disappears from public listings while remaining visible in the test booking and admin catalog.

## Step-by-Step Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory with the following content:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=YOUR_MONGO_URI

# JWT
JWT_SECRET=YOUR_JWT_SECRET

# Email
EMAIL_USER=YOUR_EMAIL_USER
EMAIL_PASS=YOUR_EMAIL_PASS

# Razorpay
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET

# Cloudinary
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

# Public origin used in password recovery emails
PUBLIC_SITE_URL=http://localhost:5000

# Optional destination for contact inquiries (defaults to EMAIL_USER)
INQUIRY_EMAIL=YOUR_INQUIRY_INBOX
```

### 3. Create Admin User
Run the following command to create an admin user:
```bash
npm run create-admin
```

Default admin credentials:
- Email: admin@hawkins.com
- Password: admin123

**Important:** Change the admin password after first login!

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Testing

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Frontend application

### Example API Calls

#### Register a User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

#### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Create Booking (with token)
```bash
POST http://localhost:5000/api/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "package": "PACKAGE_ID",
  "activities": ["ACTIVITY_ID_1", "ACTIVITY_ID_2"],
  "guestDetails": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "adults": 2,
  "children": 0,
  "specialRequests": "Late check-in please"
}
```

## Frontend Integration

Update your frontend API calls to point to:
```
http://localhost:5000/api
```

Make sure to:
1. Include JWT token in Authorization header for protected routes
2. Handle CORS if frontend is on different port
3. Update API endpoints in frontend JavaScript files

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure network access is enabled

### Email Not Sending
- Verify Gmail App Password is correct
- Check if "Less secure app access" is enabled (if required)
- Verify EMAIL_USER and EMAIL_PASS in .env

### Cloudinary Upload Issues
- Verify Cloudinary credentials
- Check file size limits (max 5MB)
- Ensure image format is supported (jpg, jpeg, png, webp)

### Razorpay Payment Issues
- Verify Razorpay keys are correct
- Check if you're using test keys (rzp_test_*) or live keys
- Ensure payment amount is in paise (multiply by 100)

## Security Notes

1. Never commit `.env` file to version control
2. Use strong JWT secrets in production
3. Enable HTTPS in production
4. Implement rate limiting for production
5. Regularly update dependencies
6. Use environment-specific configurations

## Support

For issues or questions, check the README.md file or contact the development team.

