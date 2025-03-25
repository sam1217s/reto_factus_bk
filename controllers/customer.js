import Customer from "../models/customer.js"

const httpcustomer =  {
    postCustomer: async (req,res)=>{
        try{
            const  {identification,dv,company,trade_name,names,address,email,phone,legal_organization_id,tribute_id,identification_document_id,municipality_id, state} = req.body;
            const newCustomer = new Customer({
                identification,
                dv,
                company,
                trade_name,
                names,
                address,
                email,
                phone,
                legal_organization_id,
                tribute_id,
                identification_document_id,
                municipality_id,
                state,
            })
            await newCustomer.save()
            res.json(newCustomer)
        }catch(err){
            res.status(500).json(err)
        }
    },

    getCustomer: async (req,res)=>{
        try{
            const customer = await Customer.find()
            res.json(customer)
        }catch(err){
            res.status(400).json({ error: 'Error al obtener lista de customers' })
            console.log(err)
        }
    },
    getCustomerById: async (req,res)=>{
        try{
            const customer = await Customer.findById(req.params.id)
            res.json(customer)
        }catch(err){
            res.status(400).json({ error: 'Error al obtener customer' })
            console.log(err)
        }
    },
    updateCustomer: async (req,res)=>{
        try{
           const {id} = req.params;
           const {identification,dv,company,trade_name,names,address,email,phone,legal_organization_id,tribute_id,identification_document_id,municipality_id, state} = req.body;
            let update = {
                identification,
                dv,
                company,
                trade_name,
                names,
                address,
                email,
                phone,
                legal_organization_id,
                tribute_id,
                identification_document_id,
                municipality_id,
                state
            }
            const modifiedCustomer = await Customer.findByIdAndUpdate(id,update,{new:true})
            res.json(modifiedCustomer)
        }catch(err){
            res.status(400).json({ error: 'Error al actualizar customer' })
            console.log(err)
        }
    },
    putModificarInactivo: async (req,res)=>{
        try {
            const {id} = req.params;
            const customer = await Customer.findByIdAndUpdate(id,{state:0},{new:true})
            res.json(customer)
        } catch (error) {
            res.status(400).json({error: 'Error al desactivar cliente'})
            console.log(error);
            
        } 
    },
    putModificarActivado: async (req,res)=>{
        try {
            const {id} = req.params;
            const customer = await Customer.findByIdAndUpdate(id,{state:1},{new:true})
            res.json(customer)
        } catch (error) {
            res.status(400).json({error: 'Error al activar cliente'})
            console.log(error);
            
        } 
    },
   
}

export default httpcustomer;