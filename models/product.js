import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    code_reference: {type:String,required:true, unique:true},
    name:{type:String,required:true},
    quantity: { type: Number, default: 1 },
    discount_rate: { type: Number, required: true, default: 0 },
    price:{type:Number,required:true},
    tax_rate:{type:Number,required:true},
    unit_measure_id:{type:Number,required:true},
    standard_code_id:{type:Number,required:true},
    is_excluded:{type:Number,required:true},
    tribute_id:{type:Number,required:true},
    state:{type:Number,default:1},
    withholding_taxes: [
        {
          code: { type: String },
          withholding_tax_rate: { type: Number },
        },
      ],

});

export default mongoose.model("Articulos",productSchema)