import { Router } from 'express';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Adicionar favorito
router.post('/:movieId', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    // verifica se já está nos favoritos
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }

    res.json({ message: 'Filme favoritado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao favoritar', error: err.message });
  }
});

// Listar favoritos do usuário
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar favoritos', error: err.message });
  }
});

// Remover favorito
router.delete('/:movieId', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    user.favorites = user.favorites.filter(fav => fav.toString() !== movieId);
    await user.save();

    res.json({ message: 'Filme removido dos favoritos' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover favorito', error: err.message });
  }
});

export default router;
