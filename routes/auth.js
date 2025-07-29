// routes/auth.js - VERSIÓN FINAL CON REFRESH TOKEN
import { Router } from "express";
import { check, validationResult } from "express-validator";
import authController from "../controllers/auth.js";

const router = Router();

// ✅ MIDDLEWARE PARA VALIDACIONES
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Errores de validación",
      details: errors.array(),
      code: "VALIDATION_ERROR"
    });
  }
  next();
};

// ✅ VALIDACIONES DINÁMICAS SEGÚN GRANT_TYPE
const validateOAuthRequest = [
  check("grant_type")
    .isIn(["password", "refresh_token"])
    .withMessage("Grant type debe ser 'password' o 'refresh_token'"),
  
  check("client_id")
    .notEmpty()
    .withMessage("Client ID requerido"),
  
  check("client_secret")
    .notEmpty()
    .withMessage("Client secret requerido"),
  
  // ✅ VALIDACIÓN CONDICIONAL PARA PASSWORD
  check("username")
    .if((value, { req }) => req.body.grant_type === "password")
    .isEmail()
    .withMessage("Username debe ser un email válido cuando grant_type es 'password'"),
  
  check("password")
    .if((value, { req }) => req.body.grant_type === "password")
    .notEmpty()
    .withMessage("Password requerido cuando grant_type es 'password'"),
  
  // ✅ VALIDACIÓN CONDICIONAL PARA REFRESH_TOKEN
  check("refresh_token")
    .if((value, { req }) => req.body.grant_type === "refresh_token")
    .notEmpty()
    .withMessage("Refresh token requerido cuando grant_type es 'refresh_token'")
];

// ✅ RUTA OAUTH2 TOKEN (maneja LOGIN y REFRESH)
router.post("/token", validateOAuthRequest, handleValidationErrors, authController.oauthToken);

// ✅ RUTA PARA LOGIN ALTERNATIVO (Proxy a Factus)
router.post("/login", [
  check("email")
    .isEmail()
    .withMessage("Email válido requerido"),
  check("password")
    .notEmpty()
    .withMessage("Contraseña requerida")
], handleValidationErrors, authController.login);

// ✅ RUTA PARA REFRESH TOKEN ALTERNATIVO (mantener compatibilidad)
router.post("/refresh", [
  check("refresh_token")
    .notEmpty()
    .withMessage("Refresh token requerido")
], handleValidationErrors, authController.refreshToken);

// ✅ RUTA PARA VERIFICAR TOKEN
router.get("/verify", authController.verifyToken);

// ✅ RUTAS PROXY PARA DATOS DE FACTUS
router.get("/factus/:endpoint", authController.getFactusData);

export default router;