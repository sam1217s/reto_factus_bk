// middleware/auth.js
import axios from "axios";

export const verifyFactusToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: "Token de autenticación requerido",
      code: "MISSING_TOKEN",
      details: "Incluye 'Authorization: Bearer <token>' en los headers"
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    
    console.log('🔐 Verificando token con Factus...');
    
    // Verificar token con Factus
    const response = await axios.get(
      `${process.env.FACTUS_API_URL || 'https://api-sandbox.factus.com.co'}/v1/auth/verify`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      }
    );
    
    if (!response.data.valid) {
      return res.status(401).json({
        error: "Token inválido",
        code: "INVALID_TOKEN"
      });
    }
    
    console.log('✅ Token válido');
    req.factusToken = token;
    req.factusUser = response.data.user;
    next();
    
  } catch (error) {
    console.error('❌ Error verificando token:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    
    if (status === 401) {
      return res.status(401).json({
        error: "Token expirado o inválido",
        code: "TOKEN_EXPIRED",
        details: "Usa /api/auth/refresh para renovar el token"
      });
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        error: "Servicio de autenticación no disponible",
        code: "AUTH_SERVICE_UNAVAILABLE"
      });
    }
    
    return res.status(status).json({
      error: "Error verificando autenticación",
      code: "TOKEN_VERIFICATION_FAILED",
      details: error.response?.data?.message || error.message
    });
  }
};

// ✅ MIDDLEWARE OPCIONAL - No bloquea si no hay token
export const optionalFactusToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('ℹ️ No se proporcionó token, continuando sin autenticación');
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    
    const response = await axios.get(
      `${process.env.FACTUS_API_URL || 'https://api-sandbox.factus.com.co'}/v1/auth/verify`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      }
    );
    
    if (response.data.valid) {
      req.factusToken = token;
      req.factusUser = response.data.user;
      console.log('✅ Token opcional válido');
    }
    
  } catch (error) {
    console.log('⚠️ Token opcional inválido, continuando sin autenticación');
  }
  
  next();
};

// ✅ MIDDLEWARE PARA RATE LIMITING SIMPLE
const requestCounts = new Map();

export const simpleRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }
    
    const requests = requestCounts.get(ip);
    
    // Limpiar requests antiguos
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    if (requests.length >= maxRequests) {
      return res.status(429).json({
        error: "Demasiadas peticiones",
        code: "RATE_LIMIT_EXCEEDED",
        details: `Máximo ${maxRequests} peticiones por ${windowMs / 1000} segundos`
      });
    }
    
    requests.push(now);
    next();
  };
};