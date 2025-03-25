import Invoice from "../models/invoice.js";
import axios from "axios";
import Customer from "../models/customer.js";
import Product from "../models/product.js";

const httpinvoice = {
  postInvoice: async (req, res) => {
    const authHeader = req.headers.authorization;
    let token = "";
    let dataEnvio = "";

    try {
      // 🔹 1️⃣ Verificar si hay token
      if (authHeader) {
        token = authHeader.split(" ")[1];
      } else {
        return res.status(401).json({ error: "No hay token en la solicitud" });
      }

      // 🔹 2️⃣ Extraer los datos de la factura
      const { numbering_range_id, reference_code, observation, payment_form, payment_due_date, payment_method_code, billing_period, customer, products } = req.body;

      // 🔹 3️⃣ Verificar si el cliente existe
      const existingCustomer = await Customer.findById(customer);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

/*       // 🔹 4️⃣ Verificar si los productos existen
      const existingProducts = await Product.find({ _id: { $in: products } });
      if (existingProducts.length !== products.length) {
        return res.status(404).json({ error: "Uno o más productos no existen" });
      } */

      // 🔹 5️⃣ Crear objeto de la factura para enviar a Factus
      const dataInvoice = {
        numbering_range_id,
        reference_code,
        observation,
        payment_form,
        payment_due_date,
        payment_method_code,
        billing_period,
        customer: existingCustomer,
        items: products
      };

      // 🔹 6️⃣ Enviar la factura a Factus
      let apiResponse;
      try {
        apiResponse = await axios.post(
          "https://api-sandbox.factus.com.co/v1/bills/validate",
          dataInvoice,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        dataEnvio = apiResponse;
      } catch (axiosError) {
        console.error("Error en la API de Factus:", axiosError.response?.data || axiosError.message);
        return res.status(500).json({ error: "Error al validar la factura con Factus", details: axiosError.response?.data });
      }

      // 🔹 7️⃣ Extraer datos de la respuesta de Factus
      const { cufe, url, qr, qr_image, number } = apiResponse.data.data.bill;
      const {company} = apiResponse.data.data.company;

      // 🔹 8️⃣ Guardar la factura en MongoDB
      const newInvoice = new Invoice({
        numbering_range_id,
        reference_code,
        observation,
        payment_form,
        payment_due_date,
        payment_method_code,
        billing_period,
        customer: existingCustomer,
        products: products,
        cufe,
        invoice_url: url,
        qr,
        qr_image,
        number,
        company
      });

      const savedInvoice = await newInvoice.save();

      // 🔹 9️⃣ Poblar referencias antes de responder
      const populatedInvoice = await Invoice.findById(savedInvoice._id)
        .populate("customer")
        .populate("products.product");

      console.log("Factura creada con éxito:", populatedInvoice);
      res.status(201).json({ message: "Factura creada con éxito", invoice: populatedInvoice });

    } catch (err) {
      console.error("Error interno:", err);
      res.status(500).json({ error: "Error interno del servidor", details: err.message });
    }
  },

  getInvoice: async (req, res) => {
    try {
      const invoices = await Invoice.find()
        .populate("customer")
        .populate("products.product");

      if (!invoices.length) {
        return res.status(404).json({ error: "No se encontraron facturas" });
      }
      res.json(invoices);
    } catch (err) {
      console.error("Error al obtener facturas:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
};

export default httpinvoice;
