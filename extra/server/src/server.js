require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Import Routes ---
const authRoutes = require('./api/auth');
const permitRoutes = require('./api/permits');

const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Serve Static Files from uploads directory ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/permits', permitRoutes);

// --- Serve Static React App (for production) ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
