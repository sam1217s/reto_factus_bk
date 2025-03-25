import { check } from "express-validator";
import {Router} from "express";
import httpcustomer from "../controllers/customer.js";
const router = Router();

router.post("/",[
    check("identification","Identification is required").isLength({min:1}),
    check("dv","dv is required").isLength({min:1}),
    check("company","company is required").isLength({min:1}),
    check("trade_name","trade_name is required").isLength({min:1}),
    check("names","names is required").isLength({min:1}),
    check("address","address is required").isLength({min:1}),
    check("email","email is required").isLength({min:1}),
    check("phone","phone is required").isLength({min:1}),
    check("legal_organization_id","legal_organization_id is required").isLength({min:1}),
    check("tribute_id","tribute_id is required").isLength({min:1}),
    check("identification_document_id","identification_document_id is required").isLength({min:1}),
    check("municipality_id","municipality_id is required").isLength({min:1}), 
], httpcustomer.postCustomer)

router.get("/",httpcustomer.getCustomer)

router.get("/:id",httpcustomer.getCustomerById)

router.put("/:id",[
    check("identification", "la identificación debe ser única").custom(async(identification, {req})=> await helperCustomer.validarIdentificacionPut(identification,req.params.id)),
    check("email", "el email debe ser único").custom(async(email, {req})=> await helperCustomer.validarEmailPut(email,req.params.id)),
 ],httpcustomer.updateCustomer)
 
 router.put("/inactive/:id",httpcustomer.putModificarInactivo)
 router.put("/active/:id",httpcustomer.putModificarActivado)

export default router;