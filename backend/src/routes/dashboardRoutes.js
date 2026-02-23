// const express = require('express');
// const router = express.Router();
// const dashboardController = require('../controllers/dashboardController');

// router.get('/', dashboardController.getDashboard);

// module.exports = router;

const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getDashboard);

console.log("🔥 dashboardRoutes loaded");

module.exports = router;
