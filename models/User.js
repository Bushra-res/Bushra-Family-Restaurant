import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'cashier', 'delivery', 'customer'], 
    default: 'customer' 
  },
  loyaltyPoints: { type: Number, default: 0 },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  address: { type: String },
  avatar: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
