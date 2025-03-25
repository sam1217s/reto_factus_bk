import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    code_reference: {type:String,required:true, unique:true},
    name:{type:String,required:true},
    quantity: { type: Number,},
    discount_rate: { type: Number,},
    price:{type:Number,required:true},
    tax_rate:{type:String,required:true},
    unit_measure_id:{type:Number,required:true},
    standard_code_id:{type:String,required:true},
    is_excluded:{type:Number,required:true},
    tribute_id:{type:String,required:true},
    state:{type:Number,default:1},
    withholding_taxes: [
        {
          code: { type: String },
          withholding_tax_rate: { type: String },
        },
      ],

});

export default mongoose.model("Product",productSchema)