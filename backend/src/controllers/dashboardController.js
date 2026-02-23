// const dashboardService = require('../services/dashboardService');

// const getDashboard = async (req, res, next) => {
//   try {
//     const data = await dashboardService.getDashboardData();
//     res.json(data);
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getDashboard
// };


const dashboardService = require('../services/dashboardService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard
};
