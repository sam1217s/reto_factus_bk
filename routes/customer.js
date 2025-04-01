import { check } from "express-validator";
import {Router} from "express";
import httpcustomer from "../controllers/customer.js";
const router = Router();

router.post("/", httpcustomer.postCustomer)

router.get("/",httpcustomer.getCustomer)

router.get("/:id",httpcustomer.getCustomerById)

router.put("/:id",[
    check("identification", "la identificación debe ser única").custom(async(identification, {req})=> await helperCustomer.validarIdentificacionPut(identification,req.params.id)),
    check("email", "el email debe ser único").custom(async(email, {req})=> await helperCustomer.validarEmailPut(email,req.params.id)),
 ],httpcustomer.updateCustomer)
 
 router.put("/inactive/:id",httpcustomer.putModificarInactivo)
 router.put("/active/:id",httpcustomer.putModificarActivado)

export default router;