import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
