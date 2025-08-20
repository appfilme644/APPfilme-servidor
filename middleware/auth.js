import jwt from 'jsonwebtoken';

// Middleware para verificar se o usuário está logado
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // pega depois do "Bearer"
  
  if (!token) return res.status(401).json({ message: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // adiciona info do usuário (id, role) na requisição
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar se é admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado: admin requerido' });
  }
  next();
};
