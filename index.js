import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import httpcustomer from  './routes/customer.js'
import httpproduct from  './routes/product.js'
import httpinvoice from  './routes/invoice.js'
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/customer",httpcustomer);
app.use("/api/product",httpproduct);
app.use("/api/invoice",httpinvoice);
app.use(express.static("public"));

app.listen(process.env.PORT,()=>{
    console.log("Server is running on port "+process.env.PORT);
mongoose.connect(process.env.CNX_MONGO)
.then(()=>{
    console.log("Connected to mongodb");
})
.catch((err)=>
    console.log(err)) 
})

