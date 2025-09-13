const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const ContactRoutes = require('./routes/contact');

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists and serve it statically
try {
  const uploadsDir = path.join(__dirname, 'uploads');
  const documentsDir = path.join(uploadsDir, 'documents');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
} catch (e) {
  console.warn('Failed to initialize uploads directory:', e);
}

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contact', ContactRoutes);
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/lawyer-feedback', require('./routes/lawyerFeedback'));
app.use('/api/lawyers', require('./routes/lawyer'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/clients', require('./routes/client'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/documents', require('./routes/document'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 