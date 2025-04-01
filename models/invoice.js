import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  numbering_range_id: { type: Number,  },
  reference_code: { type: String, unique: true, required: true },
  observation: { type: String },
  payment_form: { type: Object,  },
  payment_due_date: { type: Date,  },
  payment_method_code: { type: String,  },
  billing_period: {
    start_date: { type: Date,  },
    start_time: { type: String,  },
    end_date: { type: Date,  },
    end_time: { type: String, },
  },
  customer: {type: mongoose.Schema.Types.ObjectId, ref: 'Clientes', required: true },
  products:{type:Array, required:true},
  factusData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  factusCompany: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
},
{ timestamps: true }
);

export default mongoose.model("factus", InvoiceSchema);
