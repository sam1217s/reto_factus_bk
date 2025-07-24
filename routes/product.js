import { check } from "express-validator";
import { Router } from "express";
import productController from "../controllers/product.js";

const router = Router();

router.post("/", productController.createProduct)

router.get("/", productController.getAllProducts)

router.get("/:id", productController.getProductById)

router.put("/:id", productController.updateProduct)

router.put("/inactive/:id", productController.deactivateProduct)
router.put("/active/:id", productController.activateProduct)

export default router;