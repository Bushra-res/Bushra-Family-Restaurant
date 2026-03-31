import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'BUSHRA Family Restaurant' },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  billHeader: { type: String },
  billFooter: { type: String },
  tagline: { type: String, default: 'Halal Certified | Premium Dining' },
  gstin: { type: String },
  fssaiNo: { type: String },
  sacCode: { type: String, default: '996331' },
  gstEnabled: { type: Boolean, default: true },
  cgstRate: { type: Number, default: 2.5 },
  sgstRate: { type: Number, default: 2.5 },
  taxPercentage: { type: Number, default: 5 },
  currency: { type: String, default: 'INR' },
  logoUrl: { type: String },
  billShowLogo: { type: Boolean, default: true },
  billShowGST: { type: Boolean, default: true },
  billShowFSSAI: { type: Boolean, default: false },
  workingHours: {
    open: String,
    close: String
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
