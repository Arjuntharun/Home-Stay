# Setup Guide for Hawkins Homestay Backend

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Razorpay account
- Gmail account with App Password enabled

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
MONGO_URI=mongodb+srv://arjunwtsapp1_db_user:Arjun121%23@arjun.8tldgld.mongodb.net/?appName=Arjun

# JWT
JWT_SECRET=aeaa56fdc1112d087bb98a179e1b3a780335f74b622e68dfad3dc789591ca3a74c2adbde413a5884a360529b85c0bf44c9f054614e73238c0682429d8114fcc0

# Email
EMAIL_USER=arjunwtsapp1@gmail.com
EMAIL_PASS=jdbk kedi uhui cbcc

# Razorpay
RAZORPAY_KEY_ID=rzp_test_Re7Ks1Il3ik9Ci
RAZORPAY_KEY_SECRET=7Hfjeor4UI0GJD8Bn0HXcZnj

# Cloudinary
CLOUDINARY_CLOUD_NAME=dwzo1w1rw
CLOUDINARY_API_KEY=787897544381928
CLOUDINARY_API_SECRET=3AYDllwIl4ztERadYXxgtzkDZxg

# Frontend URL
FRONTEND_URL=http://localhost:5000
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

