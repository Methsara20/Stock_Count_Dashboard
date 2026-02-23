// const errorHandler = (err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     message: "Internal Server Error"
//   });
// };

// module.exports = errorHandler;


const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal Server Error"
  });
};

module.exports = errorHandler;
