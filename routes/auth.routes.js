import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    const existe = await User.findOne({ email });
    if (existe) return res.status(409).json({ message: 'Email já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUser = await User.create({ nome, email, senhaHash });

    return res.status(201).json({
      id: novoUser._id,
      nome: novoUser.nome,
      email: novoUser.email
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro no registro', error: err.message });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const senhaOk = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaOk) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );

    return res.json({
      token,
      user: { id: user._id, nome: user.nome, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro no login', error: err.message });
  }
});

export default router;
