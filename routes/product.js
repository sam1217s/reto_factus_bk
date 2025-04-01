import { check } from "express-validator";
import {Router} from "express";
import httpproduct from "../controllers/product.js";

const router = Router();

router.post("/", httpproduct.postProduct)

router.get("/",httpproduct.getProduct)

router.get("/:id",httpproduct.getProductById)

router.put("/:id",httpproduct.updateProduct)

router.put("/inactive/:id",httpproduct.putModificarInactivo)
router.put("/active/:id",httpproduct.putModificarActivado)

export default router;