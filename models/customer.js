import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    identification: { type: String, required: true },
    dv: { type: String },
    company: { type: String },
    trade_name: { type: String },
    names: { type: String,  },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    legal_organization_id: { type: String, required: true },
    tribute_id: { type: String, required: true },
    identification_document_id: { type: String, required: true },
    municipality_id: { type: String, required: true },
    state: { type: Number, default: 1 },
    
},
{
    timestamps:true
}
)

export default mongoose.model("Customer",customerSchema)