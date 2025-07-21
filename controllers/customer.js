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
            console.log('Nuevo cliente a guardar:', newCustomer)
            await newCustomer.save()
            res.json(newCustomer)
        }catch(err){
            console.error('Error al crear cliente:', err)
            res.status(500).json(err)
        }
    },

    getCustomer: async (req,res)=>{
        try{
            console.log('🔍 Buscando clientes en la base de datos local...')
            const customer = await Customer.find()
            console.log(`📊 Se encontraron ${customer.length} clientes en la base de datos local`)
            console.log('Primeros 3 clientes:', customer.slice(0, 3).map(c => ({
                id: c._id,
                identification: c.identification,
                names: c.names || c.company,
                email: c.email
            })))
            res.json(customer)
        }catch(err){
            console.error('❌ Error al obtener clientes de la base de datos:', err)
            res.status(400).json({ error: 'Error al obtener lista de customers' })
        }
    },

    getCustomerById: async (req,res)=>{
        try{
            const customer = await Customer.findById(req.params.id)
            if (!customer) {
                return res.status(404).json({ error: 'Cliente no encontrado' })
            }
            res.json(customer)
        }catch(err){
            console.error('Error al obtener cliente por ID:', err)
            res.status(400).json({ error: 'Error al obtener customer' })
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
            if (!modifiedCustomer) {
                return res.status(404).json({ error: 'Cliente no encontrado' })
            }
            res.json(modifiedCustomer)
        }catch(err){
            console.error('Error al actualizar cliente:', err)
            res.status(400).json({ error: 'Error al actualizar customer' })
        }
    },

    putModificarInactivo: async (req,res)=>{
        try {
            const {id} = req.params;
            const customer = await Customer.findByIdAndUpdate(id,{state:0},{new:true})
            if (!customer) {
                return res.status(404).json({ error: 'Cliente no encontrado' })
            }
            res.json(customer)
        } catch (error) {
            console.error('Error al desactivar cliente:', error)
            res.status(400).json({error: 'Error al desactivar cliente'})
        } 
    },

    putModificarActivado: async (req,res)=>{
        try {
            const {id} = req.params;
            const customer = await Customer.findByIdAndUpdate(id,{state:1},{new:true})
            if (!customer) {
                return res.status(404).json({ error: 'Cliente no encontrado' })
            }
            res.json(customer)
        } catch (error) {
            console.error('Error al activar cliente:', error)
            res.status(400).json({error: 'Error al activar cliente'})
        } 
    },
}

export default httpcustomer;