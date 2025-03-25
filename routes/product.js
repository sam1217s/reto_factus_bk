import { check } from "express-validator";
import {Router} from "express";
import httpproduct from "../controllers/product.js";

const router = Router();

router.post("/",[
    check("code_reference","code_reference is required").isLength({min:1}),
    check("name","name is required").isLength({min:1}),
    check("price","price is required").isLength({min:1}),
    check("tax_rate","tax_rate is required").isLength({min:1}),
    check("unit_measure_id","unit_measure_id is required").isLength({min:1}),
    check("standard_code_id","standard_code_id is required").isLength({min:1}),
    check("is_excluded","is_excluded is required").isLength({min:1}),
    check("tribute_id","tribute_id is required").isLength({min:1}), 
], httpproduct.postProduct)

router.get("/",httpproduct.getProduct)

router.get("/:id",httpproduct.getProductById)

router.put("/:id",httpproduct.updateProduct)

router.put("/inactive/:id",httpproduct.putModificarInactivo)
router.put("/active/:id",httpproduct.putModificarActivado)

export default router;