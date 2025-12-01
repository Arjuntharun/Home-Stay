const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const Package = require('../models/Package');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    // Convert buffer to base64 data URI
    const base64 = buffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64}`;
    
    cloudinary.uploader.upload(
      dataURI,
      {
        folder: 'hawkins-homestay',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
};

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ========== DASHBOARD ==========
// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalPayments[0]?.total || 0;
    const activePackages = await Package.countDocuments({ isActive: true });

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('package', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings,
          totalUsers,
          totalRevenue,
          activePackages
        },
        recentBookings
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ========== BOOKINGS ==========
// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('package', 'name')
      .populate('activities', 'name')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/bookings/:id/status
// @desc    Update booking status
// @access  Private/Admin
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user package');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ========== PACKAGES ==========
// @route   POST /api/admin/packages
// @desc    Create a new package
// @access  Private/Admin
router.post('/packages', upload.single('image'), async (req, res) => {
  try {
    const { name, description, duration, price, features } = req.body;

    const packageData = {
      name,
      description,
      duration,
      price: parseFloat(price),
      features: features ? JSON.parse(features) : []
    };

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      packageData.image = imageUrl;
      packageData.images = [imageUrl];
    }

    const newPackage = await Package.create(packageData);

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: { package: newPackage }
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/packages/:id
// @desc    Update package
// @access  Private/Admin
router.put('/packages/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, duration, price, features, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (duration) updateData.duration = duration;
    if (price) updateData.price = parseFloat(price);
    if (features) updateData.features = JSON.parse(features);
    if (isActive !== undefined) updateData.isActive = isActive === 'true';

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      updateData.image = imageUrl;
      const existingPackage = await Package.findById(req.params.id);
      updateData.images = existingPackage.images || [];
      updateData.images.push(imageUrl);
    }

    const package = await Package.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: { package }
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/packages/:id
// @desc    Delete package
// @access  Private/Admin
router.delete('/packages/:id', async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ========== ACTIVITIES ==========
// @route   POST /api/admin/activities
// @desc    Create a new activity
// @access  Private/Admin
router.post('/activities', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const activityData = {
      name,
      description,
      price: parseFloat(price)
    };

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      activityData.image = imageUrl;
      activityData.images = [imageUrl];
    }

    const newActivity = await Activity.create(activityData);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity: newActivity }
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/activities/:id
// @desc    Update activity
// @access  Private/Admin
router.put('/activities/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (isActive !== undefined) updateData.isActive = isActive === 'true';

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      updateData.image = imageUrl;
      const existingActivity = await Activity.findById(req.params.id);
      updateData.images = existingActivity.images || [];
      updateData.images.push(imageUrl);
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity }
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/activities/:id
// @desc    Delete activity
// @access  Private/Admin
router.delete('/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ========== USERS ==========
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ========== PAYMENTS ==========
// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Private/Admin
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email phone')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: { payments }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

