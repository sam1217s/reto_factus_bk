import { check } from "express-validator";
import { Router } from "express";
import customerController from "../controllers/customer.js";
const router = Router();

router.post("/", customerController.createCustomer)

router.get("/", customerController.getAllCustomers)

router.get("/:id", customerController.getCustomerById)

router.put("/:id", [
    check("identification", "la identificación debe ser única").custom(async(identification, {req})=> await helperCustomer.validarIdentificacionPut(identification,req.params.id)),
    check("email", "el email debe ser único").custom(async(email, {req})=> await helperCustomer.validarEmailPut(email,req.params.id)),
 ], customerController.updateCustomer)
 
 router.put("/inactive/:id", customerController.deactivateCustomer)
 router.put("/active/:id", customerController.activateCustomer)

export default router;