// const dashboardRepo = require('../repositories/dashboardRepository');

// const getDashboardData = async () => {

//   const summary = await dashboardRepo.getDashboardSummary();
//   const departments = await dashboardRepo.getDepartmentSummary();

//   const variancePercent = summary.total_sih
//     ? (summary.total_variance_qty / summary.total_sih) * 100
//     : 0;

//   const coveragePercent = summary.total_sih
//     ? (summary.total_counted / summary.total_sih) * 100
//     : 0;

//   return {
//     summary: {
//       ...summary,
//       variancePercent,
//       coveragePercent
//     },
//     departments
//   };
// };

// module.exports = {
//   getDashboardData
// };


const dashboardRepository = require('../repositories/dashboardRepository');

const getDashboardData = async () => {

  const summary = await dashboardRepository.getDashboardSummary();
  const departments = await dashboardRepository.getDepartmentSummary();

  return {
    summary,
    departments
  };
};

module.exports = {
  getDashboardData
};
