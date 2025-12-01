/**
 * Email Templates for Hawkins Homestay
 * Professional, responsive email templates for all communications
 */

const getBaseTemplate = (content) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hawkins Homestay</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🏠 Hawkins Homestay</h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Your Perfect Getaway Awaits</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                <strong>Hawkins Homestay</strong>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Wayanad, Kerala, India
                            </p>
                            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                                For any queries, please contact us at <a href="mailto:support@hawkinshomestay.com" style="color: #4ade80; text-decoration: none;">support@hawkinshomestay.com</a>
                            </p>
                            <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px;">
                                © ${new Date().getFullYear()} Hawkins Homestay. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

/**
 * OTP Verification Email Template
 */
exports.getOTPEmailTemplate = (name, otp) => {
  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Welcome to Hawkins Homestay!</h2>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
      Dear <strong>${name}</strong>,
    </p>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
      Thank you for registering with Hawkins Homestay! To complete your registration, please verify your email address using the OTP below:
    </p>
    
    <div style="background-color: #f3f4f6; border: 2px dashed #4ade80; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Your Verification Code</p>
      <h1 style="margin: 0; color: #4ade80; font-size: 48px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
        ${otp}
      </h1>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 5px;">
      <p style="margin: 0; color: #92400e; font-size: 13px;">
        <strong>⏰ Important:</strong> This OTP will expire in <strong>10 minutes</strong>. Please use it promptly to verify your email address.
      </p>
    </div>
    
    <p style="color: #6b7280; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
      If you didn't create an account with us, please ignore this email.
    </p>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
      Best regards,<br>
      <strong style="color: #1f2937;">Hawkins Homestay Team</strong>
    </p>
  `;
  
  return getBaseTemplate(content);
};

/**
 * Payment Confirmation & Booking Details Email Template
 */
exports.getPaymentConfirmationTemplate = (booking, payment, packageData, activities = []) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatPrice = (amount) => {
    return amount.toLocaleString('en-IN');
  };
  
  const activitiesList = activities && activities.length > 0
    ? activities.map(activity => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #1f2937; font-weight: 600;">${activity.name}</span>
          </td>
          <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #4ade80; font-weight: 700;">₹${formatPrice(activity.price)}</span>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="2" style="padding: 12px 0; color: #9ca3af; text-align: center;">No additional activities</td></tr>';
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #d1fae5; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <span style="font-size: 48px;">✅</span>
      </div>
      <h1 style="color: #1f2937; margin: 0; font-size: 32px; font-weight: bold;">Booking Confirmed!</h1>
      <p style="color: #4ade80; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">Payment Successful</p>
    </div>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
      Dear <strong>${booking.guestDetails.fullName}</strong>,
    </p>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
      Thank you for choosing Hawkins Homestay! Your payment has been successfully processed and your booking is now confirmed. We're excited to host you!
    </p>
    
    <!-- Booking Details Card -->
    <div style="background-color: #f9fafb; border-radius: 10px; padding: 25px; margin: 30px 0; border-left: 4px solid #4ade80;">
      <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #4ade80; padding-bottom: 10px;">
        📋 Booking Details
      </h3>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 40%;">Booking ID:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700;">${booking.bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Payment ID:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700;">${payment.paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Package:</td>
          <td style="padding: 8px 0; color: #1f2937;">${packageData.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Check-in:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formatDate(booking.checkIn)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Check-out:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formatDate(booking.checkOut)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Guests:</td>
          <td style="padding: 8px 0; color: #1f2937;">
            ${booking.adults} Adult(s)${booking.children > 0 ? `, ${booking.children} Child(ren)` : ''}
          </td>
        </tr>
      </table>
    </div>
    
    ${activities && activities.length > 0 ? `
    <!-- Activities Card -->
    <div style="background-color: #f9fafb; border-radius: 10px; padding: 25px; margin: 30px 0; border-left: 4px solid #4ade80;">
      <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #4ade80; padding-bottom: 10px;">
        🎯 Selected Activities
      </h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${activitiesList}
      </table>
    </div>
    ` : ''}
    
    ${booking.specialRequests ? `
    <!-- Special Requests Card -->
    <div style="background-color: #fef3c7; border-radius: 10px; padding: 20px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">📝 Special Requests</h3>
      <p style="color: #78350f; margin: 0; line-height: 1.6;">${booking.specialRequests}</p>
    </div>
    ` : ''}
    
    <!-- Payment Summary Card -->
    <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center;">
      <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Total Amount Paid</h3>
      <p style="color: #ffffff; margin: 0; font-size: 42px; font-weight: bold;">₹${formatPrice(payment.amount)}</p>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Payment Date: ${formatDate(payment.paymentDate || new Date())}</p>
    </div>
    
    <!-- Contact Information -->
    <div style="background-color: #eff6ff; border-radius: 10px; padding: 20px; margin: 30px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📞 Contact Information</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 6px 0; color: #1e3a8a; font-weight: 600;">Email:</td>
          <td style="padding: 6px 0; color: #1e40af;">${booking.guestDetails.email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #1e3a8a; font-weight: 600;">Phone:</td>
          <td style="padding: 6px 0; color: #1e40af;">${booking.guestDetails.phone}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #d1fae5; border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="color: #065f46; margin: 0; line-height: 1.6; font-weight: 600;">
        🌿 We look forward to hosting you and ensuring you have a memorable stay at Hawkins Homestay!
      </p>
    </div>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
      Best regards,<br>
      <strong style="color: #1f2937;">Hawkins Homestay Team</strong>
    </p>
  `;
  
  return getBaseTemplate(content);
};

/**
 * Welcome Email Template (after email verification)
 */
exports.getWelcomeEmailTemplate = (name) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #d1fae5; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <span style="font-size: 48px;">🎉</span>
      </div>
      <h1 style="color: #1f2937; margin: 0; font-size: 32px; font-weight: bold;">Welcome to Hawkins Homestay!</h1>
    </div>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
      Dear <strong>${name}</strong>,
    </p>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
      Your email has been verified successfully! 🎉 You can now log in to your account and start booking your perfect getaway.
    </p>
    
    <div style="background-color: #eff6ff; border-radius: 10px; padding: 25px; margin: 30px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">🚀 What's Next?</h3>
      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 2;">
        <li>Explore our amazing packages and activities</li>
        <li>Book your stay and create unforgettable memories</li>
        <li>Enjoy the beauty of Wayanad with us</li>
      </ul>
    </div>
    
    <div style="background-color: #d1fae5; border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="color: #065f46; margin: 0; line-height: 1.6; font-weight: 600;">
        🌿 We're excited to have you as part of our community and look forward to hosting you!
      </p>
    </div>
    
    <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
      Best regards,<br>
      <strong style="color: #1f2937;">Hawkins Homestay Team</strong>
    </p>
  `;
  
  return getBaseTemplate(content);
};
