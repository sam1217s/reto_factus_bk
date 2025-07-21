import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  numbering_range_id: { type: Number, required: true },
  reference_code: { type: String, unique: true, required: true },
  observation: { type: String, default: "" },
  payment_form: { type: Number, required: true },
  payment_due_date: { type: Date },
  payment_method_code: { type: String, required: true },
  billing_period: {
    start_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_date: { type: Date, required: true },
    end_time: { type: String, required: true },
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Clientes', required: true },
  products: { type: Array, required: true },
  
  // ✅ CAMPOS AGREGADOS PARA MEJOR CONTROL
  status: { 
    type: String, 
    enum: ['pending', 'issued', 'failed'], 
    default: 'pending' 
  },
  
  factusData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  factusCompany: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  
  // ✅ CAMPOS ADICIONALES ÚTILES
  attempts: { type: Number, default: 0 },
  lastError: { type: String },
  processedAt: { type: Date },
  
}, { 
  timestamps: true,
  // ✅ ÍNDICES PARA MEJOR PERFORMANCE
  indexes: [
    { reference_code: 1 },
    { status: 1 },
    { customer: 1 },
    { createdAt: -1 }
  ]
});

export default mongoose.model("factus", InvoiceSchema);
