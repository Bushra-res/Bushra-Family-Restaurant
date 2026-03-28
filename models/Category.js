import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
