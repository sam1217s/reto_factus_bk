export const verifyFactusToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      code: "MISSING_TOKEN",
      message: "Token de autenticación requerido" 
    });
  }

  try {
    // Verificar token con Factus
    const response = await axios.get(
      `${process.env.FACTUS_API_URL}/v1/auth/verify`,
      { headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.data.valid) {
      return res.status(401).json({
        code: "INVALID_TOKEN",
        message: "Token inválido o expirado"
      });
    }
    
    req.factusToken = token;
    next();
  } catch (error) {
    console.error('Error verificando token:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = status === 401 
      ? "Token inválido o expirado" 
      : "Error verificando autenticación";
    
    return res.status(status).json({
      code: "TOKEN_VERIFICATION_FAILED",
      message,
      details: error.response?.data?.message
    });
  }
};