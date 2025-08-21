import { Router } from 'express';
import Movie from '../models/Movie.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Listar filmes (público)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filtro = q ? { titulo: { $regex: q, $options: 'i' } } : {};
    const filmes = await Movie.find(filtro).sort({ createdAt: -1 });
    return res.json(filmes);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar filmes', error: err.message });
  }
});

// Detalhe do filme (rota protegida)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const filme = await Movie.findById(req.params.id);
    if (!filme) return res.status(404).json({ message: 'Filme não encontrado' });
    return res.json(filme);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar filme', error: err.message });
  }
});

// Adicionar filme (apenas admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { titulo, genero, ano, sinopse, capaUrl } = req.body;
    const novo = await Movie.create({ titulo, genero, ano, sinopse, capaUrl });
    return res.status(201).json(novo);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar filme', error: err.message });
  }
});

// Atualizar filme (apenas admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, genero, ano, sinopse, capaUrl } = req.body;

    const atualizado = await Movie.findByIdAndUpdate(
      id,
      { titulo, genero, ano, sinopse, capaUrl },
      { new: true } // retorna o filme já atualizado
    );

    if (!atualizado) {
      return res.status(404).json({ message: 'Filme não encontrado' });
    }

    return res.json(atualizado);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar filme', error: err.message });
  }
});

// Deletar filme (apenas admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await Movie.findByIdAndDelete(id);

    if (!deletado) {
      return res.status(404).json({ message: 'Filme não encontrado' });
    }

    return res.json({ message: 'Filme removido com sucesso' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao deletar filme', error: err.message });
  }
});

export default router;

