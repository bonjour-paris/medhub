const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authroutes');
const productRoutes = require('./routes/productroutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send("MongoDB Connection Working ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
