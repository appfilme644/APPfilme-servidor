import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { OAuth2Client } from "google-auth-library";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) return res.status(400).json({ message: "Token não enviado" });

    // 1. Verifica o token com a lib oficial
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // 2. Pega os dados do usuário
    const { sub, email, name, picture } = payload;

    // 3. Verifica se usuário já existe no banco
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        nome: name,
        email,
        googleId: sub,
        avatar: picture,
        role: "user",
      });
    }

    // 4. Cria token JWT da sua API
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, user });
  } catch (err) {
    console.error("Erro Google Login:", err);
    return res.status(401).json({ message: "Token inválido" });
  }
});

export default router;
