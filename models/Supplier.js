import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  contactPerson: { type: String },
  itemsSupplied: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
