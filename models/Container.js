import mongoose from 'mongoose';

const ContainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Container || mongoose.model('Container', ContainerSchema);
