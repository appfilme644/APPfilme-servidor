import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    genero: { type: String, required: true },
    ano: { type: Number, required: true },
    sinopse: { type: String, required: true },
    capaUrl: { type: String } // opcional
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
