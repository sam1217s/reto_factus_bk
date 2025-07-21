// ===== middleware/rateLimiter.js =====

export const invoiceRateLimiter = (req, res, next) => {
  // Obtener identificación del usuario (por IP o token)
  const userKey = req.ip || req.headers.authorization?.split(' ')[1]?.substr(-10) || 'anonymous';
  
  // Cache simple en memoria (en producción usar Redis)
  if (!global.invoiceAttempts) {
    global.invoiceAttempts = new Map();
  }
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxAttempts = 3; // Máximo 3 facturas por minuto
  
  const userAttempts = global.invoiceAttempts.get(userKey) || [];
  
  // Filtrar intentos dentro de la ventana de tiempo
  const recentAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    const oldestAttempt = Math.min(...recentAttempts);
    const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
    
    return res.status(429).json({
      error: `Demasiadas facturas creadas. Espera ${waitTime} segundos.`,
      code: "INVOICE_RATE_LIMIT",
      retryAfter: waitTime
    });
  }
  
  // Registrar este intento
  recentAttempts.push(now);
  global.invoiceAttempts.set(userKey, recentAttempts);
  
  // Limpiar cache cada hora
  if (!global.lastCleanup || now - global.lastCleanup > 60 * 60 * 1000) {
    global.invoiceAttempts.clear();
    global.lastCleanup = now;
  }
  
  next();
};

// ===== middleware/validateFactusData.js =====

export const validateFactusData = (req, res, next) => {
  const { products, customer } = req.body;
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      error: "Se requiere al menos un producto",
      code: "MISSING_PRODUCTS"
    });
  }
  
  if (!customer) {
    return res.status(400).json({
      error: "Se requiere un cliente",
      code: "MISSING_CUSTOMER"
    });
  }
  
  // Validar estructura de productos
  for (const product of products) {
    if (!product.product) {
      return res.status(400).json({
        error: "Cada producto debe tener un ID válido",
        code: "INVALID_PRODUCT_ID"
      });
    }
    
    if (!product.quantity || product.quantity <= 0) {
      return res.status(400).json({
        error: "Cada producto debe tener cantidad mayor a 0",
        code: "INVALID_QUANTITY"
      });
    }
  }
  
  next();
};

// ===== middleware/logRequests.js =====

export const logInvoiceRequests = (req, res, next) => {
  const startTime = Date.now();
  
  // Log de inicio
  console.log(`🚀 [${new Date().toISOString()}] ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    reference_code: req.body?.reference_code,
    customer_id: req.body?.customer
  });
  
  // Interceptar respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    console.log(`✅ [${new Date().toISOString()}] Response ${statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.path,
      status: statusCode,
      duration: `${duration}ms`
    });
    
    originalSend.call(this, data);
  };
  
  next();
};