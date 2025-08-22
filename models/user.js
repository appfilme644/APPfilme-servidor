import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    senhaHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
      favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

