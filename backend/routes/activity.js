const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// @route   GET /api/activities
// @desc    Get all activities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find({ isActive: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: activities.length,
      data: { activities }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/activities/:id
// @desc    Get single activity
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

