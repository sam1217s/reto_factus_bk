 import Product from "../models/product.js"

 const httpproduct =  {
    postProduct: async (req,res)=>{
        try{
            const  {code_reference,name,quantity,discount_rate, price,tax_rate,unit_measure_id,standard_code_id,is_excluded,tribute_id,withholding_taxes,state} = req.body;
            const newProduct = new Product({
                code_reference,
                name,
                quantity,
            discount_rate,
                price,
                tax_rate,
                unit_measure_id,
                standard_code_id,
                is_excluded,
                tribute_id,
                withholding_taxes,
                state,          
            })
            console.log(newProduct) 
            await newProduct.save()
            res.json(newProduct)
        }catch(err){
            res.status(500).json(err)
        }
    },

    getProduct: async (req,res)=>{
        try{
            const product = await Product.find()
            res.json(product)
        }catch(err){
            res.status(400).json({ error: 'Error al obtener lista de productos' })
            console.log(err)
        }
    },
    getProductById: async (req,res)=>{
        try{
            const product = await Product.findById(req.params.id)
            res.json(product)
        }catch(err){
            res.status(400).json({ error: 'Error al obtener producto' })
            console.log(err)
        }
    },
    updateProduct: async (req,res)=>{
        try{
            const {id} = req.params;
            const {code_reference,name,quantity,discount_rate, price,tax_rate,unit_measure_id,standard_code_id,is_excluded,tribute_id,withholding_taxes,state} = req.body;
            let update = {
                code_reference,
                name,
                quantity,
                discount_rate,
                price,
                tax_rate,
                unit_measure_id,
                standard_code_id,
                is_excluded,
                tribute_id,
                withholding_taxes,
                state
            }
            const modifiedProduct = await Product.findByIdAndUpdate(id,update,{new:true})
            res.json(modifiedProduct)
        }catch(err){
            res.status(400).json({ error: 'Error al actualizar producto' })
            console.log(err)
        }
    },
    putModificarInactivo: async (req,res)=>{
        try {
            const {id} = req.params;
            const product = await Product.findByIdAndUpdate(id,{estado:0},{new:true})
            res.json(product)
        } catch (error) {
            res.status(400).json({error: 'Error al desactivar producto'})
            console.log(error);
            
        } 
    },
    putModificarActivado: async (req,res)=>{
        try {
            const {id} = req.params;
            const product = await Product.findByIdAndUpdate(id,{estado:1},{new:true})
            res.json(product)
        } catch (error) {
            res.status(400).json({error: 'Error al activar producto'})
            console.log(error);
            
        } 
    },  
}

export default httpproduct;