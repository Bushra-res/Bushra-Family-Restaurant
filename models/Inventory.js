import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'kg' },
  minStockLevel: { type: Number, default: 10 },
  lastRestocked: { type: Date, default: Date.now },
  costPerUnit: { type: Number, default: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
}, { timestamps: true });

export default mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
