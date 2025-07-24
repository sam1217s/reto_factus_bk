// ===== controllers/invoice.js - 100% CONFORME A DOCUMENTACIÓN FACTUS =====

import Invoice from "../models/invoice.js";
import axios from "axios";
import Customer from "../models/customer.js";
import Product from "../models/product.js";

const invoiceController = {
  createInvoice: async (req, res) => {
    const authHeader = req.headers.authorization;
    let token = "";

    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: "Token de autenticación requerido",
          code: "MISSING_TOKEN" 
        });
      }
      
      token = authHeader.split(" ")[1];

      const {
        numbering_range_id,
        reference_code,
        observation,
        payment_form,
        payment_due_date,
        payment_method_code,
        billing_period,
        customer,
        products,
      } = req.body;

      console.log('📤 === FACTURA CONFORME A DOCUMENTACIÓN FACTUS ===');

      // ✅ VALIDACIONES PREVIAS
      if (!customer || !products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ 
          error: "Datos incompletos",
          code: "INVALID_DATA" 
        });
      }

      // ✅ GENERAR REFERENCE_CODE ÚNICO
      let finalReferenceCode = reference_code || `INV${Date.now()}`;

      let attempts = 0;
      while (attempts < 5) {
        const existingInvoice = await Invoice.findOne({ reference_code: finalReferenceCode });
        if (!existingInvoice) break;
        finalReferenceCode = `INV${Date.now()}${attempts}`;
        attempts++;
      }

      console.log(`✅ Reference code: ${finalReferenceCode}`);

      // ✅ OBTENER Y VALIDAR CLIENTE
      const existingCustomer = await Customer.findById(customer);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      // ✅ OBTENER Y VALIDAR PRODUCTOS  
      const productIds = products.map(p => p.product);
      const existingProducts = await Product.find({ _id: { $in: productIds } });
      
      if (existingProducts.length !== productIds.length) {
        return res.status(400).json({ error: "Productos no encontrados" });
      }

      // ✅ PREPARAR CLIENTE CONFORME A DOCUMENTACIÓN
      const factusCustomer = {
        identification_document_id: Number(existingCustomer.identification_document_id),
        identification: String(existingCustomer.identification).trim(),
        dv: existingCustomer.dv || "",
        company: existingCustomer.company || "",
        trade_name: existingCustomer.trade_name || "",
        names: existingCustomer.names || "",
        address: String(existingCustomer.address || "DIRECCIÓN NO ESPECIFICADA").trim(),
        email: String(existingCustomer.email).trim().toLowerCase(),
        phone: String(existingCustomer.phone || "").replace(/[^0-9]/g, '') || "3001234567",
        legal_organization_id: Number(existingCustomer.legal_organization_id),
        tribute_id: Number(existingCustomer.tribute_id),
        municipality_id: Number(existingCustomer.municipality_id) || 11001, // Bogotá por defecto
      };

      console.log('✅ Cliente preparado:', {
        identification_document_id: factusCustomer.identification_document_id,
        identification: factusCustomer.identification,
        legal_organization_id: factusCustomer.legal_organization_id,
        tribute_id: factusCustomer.tribute_id
      });

      // ✅ PREPARAR PRODUCTOS CONFORME A DOCUMENTACIÓN
      const factusItems = [];
      
      for (const item of products) {
        const productData = existingProducts.find(prod => prod._id.toString() === item.product);
        
        const quantity = Number(item.quantity) || 1;
        const basePrice = Number(item.price || productData.price);
        const taxRate = Number(item.tax_rate !== undefined ? item.tax_rate : productData.tax_rate);
        const discountRate = Number(item.discount_rate || productData.discount_rate || 0);
        
        // ✅ CALCULAR PRECIO CON IMPUESTOS INCLUIDOS (como requiere Factus)
        const priceWithTax = basePrice * (1 + (taxRate / 100));

        const factusItem = {
          // ✅ CAMPOS SEGÚN DOCUMENTACIÓN OFICIAL
          scheme_id: "1", // Estándar
          note: "",
          code_reference: String(item.code_reference || productData.code_reference).trim(),
          name: String(item.name || productData.name).trim(),
          quantity: quantity,
          discount_rate: discountRate,
          price: priceWithTax, // ✅ CON IMPUESTOS INCLUIDOS como requiere la documentación
          tax_rate: taxRate,
          unit_measure_id: Number(item.unit_measure_id || productData.unit_measure_id),
          standard_code_id: Number(item.standard_code_id || productData.standard_code_id || 1), // Default: Estándar de adopción del contribuyente
          is_excluded: Number(item.is_excluded || productData.is_excluded || 0),
          tribute_id: Number(item.tribute_id || productData.tribute_id),
          withholding_taxes: [], // Simplificado para evitar errores
          mandate: {
            identification_document_id: Number(factusCustomer.identification_document_id),
            identification: String(factusCustomer.identification),
          },
        };

        console.log(`✅ Producto preparado:`, {
          name: factusItem.name,
          price: factusItem.price,
          tax_rate: factusItem.tax_rate,
          unit_measure_id: factusItem.unit_measure_id,
          tribute_id: factusItem.tribute_id
        });

        factusItems.push(factusItem);
      }

      // ✅ PREPARAR BILLING_PERIOD CONFORME A DOCUMENTACIÓN
      const now = new Date();
      const billingPeriod = {
        start_date: billing_period?.start_date || now.toISOString().split('T')[0],
        start_time: formatTimeForFactus(billing_period?.start_time) || "08:00:00",
        end_date: billing_period?.end_date || now.toISOString().split('T')[0],
        end_time: formatTimeForFactus(billing_period?.end_time) || "18:00:00",
      };

      // ✅ VALIDAR CÓDIGOS SEGÚN DOCUMENTACIÓN
      const validPaymentMethods = ["10", "42", "20", "47", "71", "72", "1", "49", "48", "ZZZ"];
      if (!validPaymentMethods.includes(String(payment_method_code))) {
        return res.status(400).json({
          error: "Método de pago inválido",
          details: `Códigos válidos: ${validPaymentMethods.join(', ')}`
        });
      }

      const validPaymentForms = [1, 2]; // 1=Contado, 2=Crédito
      if (!validPaymentForms.includes(Number(payment_form))) {
        return res.status(400).json({
          error: "Forma de pago inválida",
          details: "Valores válidos: 1 (contado), 2 (crédito)"
        });
      }

      // ✅ PAYLOAD COMPLETAMENTE CONFORME A DOCUMENTACIÓN FACTUS
      const dataInvoice = {
        // ✅ CAMPO OBLIGATORIO QUE FALTABA
        document: "01", // Factura electrónica de Venta
        
        numbering_range_id: Number(numbering_range_id),
        reference_code: finalReferenceCode,
        observation: String(observation || "").substring(0, 250), // ✅ Máximo 250 caracteres
        payment_form: Number(payment_form),
        payment_due_date: payment_due_date || null,
        payment_method_code: String(payment_method_code),
        
        // ✅ CÓDIGOS CORRECTOS SEGÚN DOCUMENTACIÓN
        operation_type: 10, // Estándar
        send_email: false,
        order_reference: "",
        
        billing_period: billingPeriod,
        customer: factusCustomer,
        items: factusItems,
      };

      console.log('📤 === PAYLOAD CONFORME A DOCUMENTACIÓN FACTUS ===');
      console.log('🔸 document:', dataInvoice.document, '(01 = Factura electrónica de Venta)');
      console.log('🔸 operation_type:', dataInvoice.operation_type, '(10 = Estándar)');
      console.log('🔸 payment_form:', dataInvoice.payment_form, `(${dataInvoice.payment_form === 1 ? 'Contado' : 'Crédito'})`);
      console.log('🔸 payment_method_code:', dataInvoice.payment_method_code);
      console.log('🔸 items count:', dataInvoice.items.length);
      console.log('🔸 customer tribute_id:', dataInvoice.customer.tribute_id);

      // ✅ ENVIAR A FACTUS
      try {
        console.log('📤 Enviando payload conforme a documentación oficial...');
        
        const apiResponse = await axios.post(
          "https://api-sandbox.factus.com.co/v1/bills/validate",
          dataInvoice,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 45000
          }
        );
        
        console.log('🎉 === ¡ÉXITO TOTAL! FACTURA ACEPTADA POR FACTUS ===');
        console.log('✅ Status:', apiResponse.status);
        console.log('✅ Invoice ID:', apiResponse.data.invoice_id);
        console.log('✅ Número oficial:', apiResponse.data.data?.bill?.number);
        console.log('✅ CUFE:', apiResponse.data.data?.bill?.cufe);

        // ✅ EXTRAER DATOS DE RESPUESTA
        const factusCompany = {
          invoice_id: apiResponse.data.invoice_id,
          ...apiResponse.data.data?.company,
        };
        
        const factusData = {
          invoice_id: apiResponse.data.invoice_id,
          ...apiResponse.data.data?.bill,
        };

        // ✅ GUARDAR EN BASE DE DATOS
        const newInvoice = new Invoice({
          numbering_range_id: Number(numbering_range_id),
          reference_code: finalReferenceCode,
          observation: observation || "",
          payment_form: Number(payment_form),
          payment_due_date,
          payment_method_code,
          billing_period: billingPeriod,
          customer: existingCustomer._id,
          products,
          factusData,
          factusCompany,
          status: factusData.cufe ? 'issued' : 'pending',
          attempts: 1,
          processedAt: new Date()
        });

        const savedInvoice = await newInvoice.save();
        console.log('💾 === FACTURA GUARDADA EXITOSAMENTE ===');
        console.log('✅ ID en BD:', savedInvoice._id);
        console.log('✅ Status:', savedInvoice.status);
        console.log('✅ Reference code:', savedInvoice.reference_code);

        const populatedInvoice = await Invoice.findById(savedInvoice._id).populate("customer");

        res.status(201).json({ 
          message: "¡Factura creada exitosamente según estándares Factus!", 
          invoice: populatedInvoice,
          factus_reference: factusData.number || finalReferenceCode,
          factus_invoice_id: apiResponse.data.invoice_id,
          factus_cufe: factusData.cufe,
          success: true
        });

      } catch (factusError) {
        console.log('❌ === ERROR EN FACTUS ===');
        console.log('Status:', factusError.response?.status);
        console.log('Headers:', factusError.response?.headers);
        console.log('Error Data:', JSON.stringify(factusError.response?.data, null, 2));
        
        const errorData = factusError.response?.data;
        const status = factusError.response?.status;

        let errorMessage = "Error en Factus";
        let errorDetails = factusError.message;

        if (status === 422) {
          errorMessage = "Error de validación en Factus";
          if (errorData?.data?.errors) {
            errorDetails = `Campos inválidos: ${JSON.stringify(errorData.data.errors)}`;
          } else if (errorData?.message) {
            errorDetails = errorData.message;
          }
        } else if (status === 401) {
          errorMessage = "Token expirado o inválido";
          errorDetails = "Inicia sesión nuevamente";
        }

        return res.status(status === 422 ? 422 : 500).json({
          error: errorMessage,
          details: errorDetails,
          code: "FACTUS_API_ERROR",
          factus_status: status,
          factus_data: errorData,
          sent_payload: dataInvoice // Para debugging
        });
      }

    } catch (err) {
      console.error("❌ Error crítico:", err);
      res.status(500).json({ 
        error: "Error interno del servidor", 
        details: err.message,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  },

  getAllInvoices: async (req, res) => {
    try {
      const { status } = req.query;
      const filter = status ? { status } : {};
      const invoices = await Invoice.find(filter).populate("customer").sort({ createdAt: -1 });
      res.json(invoices);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener facturas", details: err.message });
    }
  },

  updateInvoiceStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, factusData } = req.body;
      const updateData = { status };
      if (factusData) updateData.factusData = { ...factusData };
      
      const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true }).populate("customer");
      if (!updatedInvoice) return res.status(404).json({ error: "Factura no encontrada" });
      
      res.json(updatedInvoice);
    } catch (err) {
      res.status(500).json({ error: "Error al actualizar factura", details: err.message });
    }
  },
};

// ✅ FUNCIÓN AUXILIAR PARA FORMATEAR TIEMPO SEGÚN FACTUS
function formatTimeForFactus(timeString) {
  if (!timeString) return null;
  
  // Si ya tiene formato HH:mm:ss, devolverlo
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return timeString;
  }
  
  // Si tiene formato HH:mm, agregar :00
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return `${timeString}:00`;
  }
  
  return timeString;
}

export default invoiceController;