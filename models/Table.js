import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved', 'maintenance'], 
    default: 'available' 
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  qrCode: { type: String },
}, { timestamps: true });

export default mongoose.models.Table || mongoose.model('Table', TableSchema);
