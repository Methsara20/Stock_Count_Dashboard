// require('dotenv').config();
// const app = require('./src/app');

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// setInterval(() => {}, 1000);

// require('dotenv').config();

// const app = require('./src/app');
// const { poolPromise } = require('./src/config/db');

// const PORT = process.env.PORT || 5000;

// // Start server AFTER DB connection
// poolPromise
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error("❌ Database connection failed", err);
//   });


// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const { poolPromise } = require('./src/config/db');

// const dashboardRoutes = require('./src/routes/dashboardRoutes');
// const errorHandler = require('./src/middlewares/errorMiddleware');

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/dashboard', dashboardRoutes);

// // Error middleware
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// console.log("🔥 SERVER FILE RUNNING");


// // Start server AFTER DB connection
// poolPromise
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error("❌ Database connection failed", err);
//   });

require('dotenv').config();
const path = require('path');

const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./src/config/db');

const dashboardRoutes = require('./src/routes/dashboardRoutes');
const errorHandler = require('./src/middlewares/errorMiddleware');

const app = express(); // ⭐ MUST COME BEFORE app.use()

app.use(cors());
app.use(express.json());

/* ===============================
   Serve React Frontend (Production)
================================= */
app.use(express.static(path.join(__dirname, '../frontend/dist')));

/* ===============================
   Test Route
================================= */
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

/* ===============================
   API Routes
================================= */
app.use('/api/dashboard', dashboardRoutes);

console.log("✅ Routes registered:");
console.log("   - GET /api/test");
console.log("   - GET /api/dashboard");

/* ===============================
   React SPA Fallback
================================= */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});


/* ===============================
   Error Middleware
================================= */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

console.log("🔥 SERVER FILE RUNNING");

/* ===============================
   Start Server After DB Connect
================================= */
poolPromise
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Test: http://localhost:${PORT}/api/test`);
      console.log(`📡 Dashboard: http://localhost:${PORT}/api/dashboard`);
    });
  })
  .catch(err => {
    console.error("❌ Database connection failed.", err);
  });
