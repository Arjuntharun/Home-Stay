# API Reference - Hawkins Homestay Backend

Base URL: `http://localhost:5000/api`

## Authentication Endpoints

### Register User
```
POST /auth/register
Body: {
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
Response: { success: true, data: { user, token } }
```

### Login
```
POST /auth/login
Body: {
  "email": "string",
  "password": "string"
}
Response: { success: true, data: { user, token } }
```

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>
Response: { success: true, data: { user } }
```

## User Endpoints

### Get Profile
```
GET /user/profile
Headers: Authorization: Bearer <token>
Response: { success: true, data: { user } }
```

### Update Profile
```
PUT /user/profile
Headers: Authorization: Bearer <token>
Body: {
  "name": "string",
  "phone": "string"
}
Response: { success: true, data: { user } }
```

### Get User Bookings
```
GET /user/bookings
Headers: Authorization: Bearer <token>
Response: { success: true, data: { bookings } }
```

### Get User Payments
```
GET /user/payments
Headers: Authorization: Bearer <token>
Response: { success: true, data: { payments } }
```

## Booking Endpoints

### Create Booking
```
POST /bookings
Headers: Authorization: Bearer <token>
Body: {
  "package": "package_id",
  "activities": ["activity_id1", "activity_id2"],
  "guestDetails": {
    "fullName": "string",
    "email": "string",
    "phone": "string"
  },
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "adults": number,
  "children": number,
  "specialRequests": "string"
}
Response: { success: true, data: { booking } }
```

### Get Booking
```
GET /bookings/:id
Headers: Authorization: Bearer <token>
Response: { success: true, data: { booking } }
```

### Cancel Booking
```
PUT /bookings/:id/cancel
Headers: Authorization: Bearer <token>
Response: { success: true, data: { booking } }
```

## Payment Endpoints

### Create Payment Order
```
POST /payments/create-order
Headers: Authorization: Bearer <token>
Body: {
  "bookingId": "booking_id"
}
Response: { 
  success: true, 
  data: { 
    orderId: "razorpay_order_id",
    amount: number,
    currency: "INR",
    keyId: "razorpay_key_id"
  }
}
```

### Verify Payment
```
POST /payments/verify
Headers: Authorization: Bearer <token>
Body: {
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string",
  "bookingId": "booking_id"
}
Response: { success: true, data: { payment, booking } }
```

### Get Payment Details
```
GET /payments/:id
Headers: Authorization: Bearer <token>
Response: { success: true, data: { payment } }
```

## Package Endpoints (Public)

### Get All Packages
```
GET /packages
Response: { success: true, data: { packages } }
```

### Get Single Package
```
GET /packages/:id
Response: { success: true, data: { package } }
```

## Activity Endpoints (Public)

### Get All Activities
```
GET /activities
Response: { success: true, data: { activities } }
```

### Get Single Activity
```
GET /activities/:id
Response: { success: true, data: { activity } }
```

## Admin Endpoints (Admin Only)

### Dashboard Stats
```
GET /admin/dashboard
Headers: Authorization: Bearer <admin_token>
Response: { success: true, data: { stats, recentBookings } }
```

### Get All Bookings
```
GET /admin/bookings
Headers: Authorization: Bearer <admin_token>
Response: { success: true, data: { bookings } }
```

### Update Booking Status
```
PUT /admin/bookings/:id/status
Headers: Authorization: Bearer <admin_token>
Body: {
  "status": "pending" | "confirmed" | "cancelled" | "completed"
}
Response: { success: true, data: { booking } }
```

### Create Package
```
POST /admin/packages
Headers: Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body: {
  "name": "string",
  "description": "string",
  "duration": "string",
  "price": number,
  "features": "JSON array string",
  "image": File
}
Response: { success: true, data: { package } }
```

### Update Package
```
PUT /admin/packages/:id
Headers: Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body: {
  "name": "string",
  "description": "string",
  "duration": "string",
  "price": number,
  "features": "JSON array string",
  "isActive": "true" | "false",
  "image": File (optional)
}
Response: { success: true, data: { package } }
```

### Delete Package
```
DELETE /admin/packages/:id
Headers: Authorization: Bearer <admin_token>
Response: { success: true, message: "Package deleted successfully" }
```

### Create Activity
```
POST /admin/activities
Headers: Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body: {
  "name": "string",
  "description": "string",
  "price": number,
  "image": File
}
Response: { success: true, data: { activity } }
```

### Update Activity
```
PUT /admin/activities/:id
Headers: Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body: {
  "name": "string",
  "description": "string",
  "price": number,
  "isActive": "true" | "false",
  "image": File (optional)
}
Response: { success: true, data: { activity } }
```

### Delete Activity
```
DELETE /admin/activities/:id
Headers: Authorization: Bearer <admin_token>
Response: { success: true, message: "Activity deleted successfully" }
```

### Get All Users
```
GET /admin/users
Headers: Authorization: Bearer <admin_token>
Response: { success: true, data: { users } }
```

### Get All Payments
```
GET /admin/payments
Headers: Authorization: Bearer <admin_token>
Response: { success: true, data: { payments } }
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development mode)"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Notes

1. All protected routes require `Authorization: Bearer <token>` header
2. Admin routes require user role to be `admin`
3. Image uploads are limited to 5MB
4. Supported image formats: jpg, jpeg, png, webp
5. Payment amounts should be in paise (multiply by 100)
6. Dates should be in YYYY-MM-DD format

