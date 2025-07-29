import invoiceController from "../controllers/invoice.js";
import express from "express";
import { check, validationResult } from "express-validator";
import { Router } from "express";

const router = Router();

// ✅ MIDDLEWARE SIMPLE PARA MANEJAR ERRORES DE VALIDACIÓN
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Errores de validación:', errors.array());
    return res.status(400).json({
      error: "Errores de validación",
      details: errors.array(),
      code: "VALIDATION_ERROR"
    });
  }
  next();
};

// ✅ MIDDLEWARE SIMPLE DE LOGGING
const logRequests = (req, res, next) => {
  console.log(`🚀 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// ✅ RUTA PRINCIPAL PARA CREAR FACTURAS
router.post("/", 
  logRequests,
  [
    check("numbering_range_id")
      .notEmpty()
      .withMessage("numbering_range_id es requerido")
      .isNumeric()
      .withMessage("numbering_range_id debe ser numérico"),
    
    check("customer")
      .notEmpty()
      .withMessage("customer es requerido")
      .isMongoId()
      .withMessage("customer debe ser un ID válido de MongoDB"),
    
    check("products")
      .isArray({ min: 1 })
      .withMessage("products debe ser un array con al menos un elemento"),
    
    check("payment_form")
      .notEmpty()
      .withMessage("payment_form es requerido")
      .isIn([1, 2])
      .withMessage("payment_form debe ser 1 (contado) o 2 (crédito)"),
    
    check("payment_method_code")
      .notEmpty()
      .withMessage("payment_method_code es requerido")
      .isString()
      .withMessage("payment_method_code debe ser texto"),
  ],
  handleValidationErrors,
  invoiceController.createInvoice
);

// ✅ RUTA PARA OBTENER FACTURAS
router.get("/", 
  logRequests,
  invoiceController.getAllInvoices
);

// ✅ RUTA PARA ACTUALIZAR STATUS DE FACTURA
router.put("/:id", 
  logRequests,
  [
    check("id")
      .isMongoId()
      .withMessage("ID debe ser un ID válido de MongoDB"),
  ],
  handleValidationErrors,
  invoiceController.updateInvoiceStatus
);

// ✅ RUTA PARA OBTENER FACTURAS POR STATUS (mantenida para compatibilidad)
router.get("/status/:status", 
  logRequests,
  (req, res, next) => {
    req.query.status = req.params.status;
    next();
  }, 
  invoiceController.getAllInvoices
);

// ✅ RUTA PARA OBTENER UNA FACTURA ESPECÍFICA
router.get("/:id",
  logRequests,
  [
    check("id")
      .isMongoId()
      .withMessage("ID debe ser un ID válido de MongoDB"),
  ],
  handleValidationErrors,
  invoiceController.getInvoiceById  // ← Esta función ahora existe en el controlador
);

export default router;