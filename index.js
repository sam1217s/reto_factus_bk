import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import httpcustomer from './routes/customer.js'
import httpproduct from './routes/product.js'
import httpinvoice from './routes/invoice.js'
import cors from "cors";

import path from "path";
import { fileURLToPath } from 'url';

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ✅ CONFIGURACIÓN DE CORS MEJORADA
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Permitir frontend y testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ MIDDLEWARE MEJORADO
app.use(express.json({ limit: '10mb' })); // Aumentar límite para facturas grandes
app.use(express.urlencoded({ extended: true }));

// ✅ MIDDLEWARE DE LOGGING
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ MIDDLEWARE DE HEALTHCHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ✅ RUTAS
app.use("/api/customer", httpcustomer);
app.use("/api/product", httpproduct);
app.use("/api/invoice", httpinvoice);
app.use(express.static("public"));

// ✅ MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON malformado',
      code: 'INVALID_JSON'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

// ✅ RUTA CATCH-ALL PARA SPA
app.use('*', (req, res) => {
  // Si es una petición GET desde el navegador, servir el index.html
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // Para peticiones API, devolver 404 JSON
    res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.originalUrl,
      code: 'NOT_FOUND'
    });
  }
});

// ✅ CONFIGURACIÓN DE MONGODB MEJORADA
mongoose.set('strictQuery', false);

// ✅ INICIO DEL SERVIDOR CON MEJOR MANEJO
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  
  try {
    await mongoose.connect(process.env.CNX_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");
    console.log(`📊 Base de datos: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  }
});

// ✅ MANEJO DE CIERRE GRACEFUL
process.on('SIGINT', async () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cerrando conexión:', err);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
});


