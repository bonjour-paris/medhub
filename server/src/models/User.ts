import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  companyName: String,
  email: { type: String, required: true, unique: true },
  contactNumber: String,
  originCountry: String,
  logoUrl: String,
  role: { type: String, enum: ['seller', 'customer', 'admin'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  sellerId: String,
  adminRole: { type: String, enum: ['superadmin', 'useradmin'] },
  password: String,
  name: String,
}, { timestamps: true });

export default mongoose.model('User', userSchema);