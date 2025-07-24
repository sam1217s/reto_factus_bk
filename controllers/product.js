import Product from "../models/product.js"

const productController = {
    createProduct: async (req, res) => {
        try {
            const { code_reference, name, quantity, discount_rate, price, tax_rate, price_includes_tax, unit_measure_id, standard_code_id, is_excluded, tribute_id, withholding_taxes, state } = req.body;
            const newProduct = new Product({
                code_reference,
                name,
                quantity,
                discount_rate,
                price,
                tax_rate,
                price_includes_tax,
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
        } catch (err) {
            res.status(500).json(err)
        }
    },

    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find()

            // Ajustar precios para facturación si incluyen IVA
            const adjustedProducts = products.map(product => {
                const productObj = product.toObject();

                // Si el precio incluye IVA y hay tasa de impuesto, calcular precio sin IVA
                if (productObj.price_includes_tax && productObj.tax_rate > 0) {
                    productObj.price_without_tax = productObj.price / (1 + productObj.tax_rate / 100);
                    productObj.original_price = productObj.price;
                    productObj.price = productObj.price_without_tax; // Precio para facturación
                }

                return productObj;
            });

            res.json(adjustedProducts)
        } catch (err) {
            res.status(400).json({ error: 'Error al obtener lista de productos' })
            console.log(err)
        }
    },

    getProductById: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id)
            const productObj = product.toObject();

            // Ajustar precio si incluye IVA
            if (productObj.price_includes_tax && productObj.tax_rate > 0) {
                productObj.price_without_tax = productObj.price / (1 + productObj.tax_rate / 100);
                productObj.original_price = productObj.price;
                productObj.price = productObj.price_without_tax;
            }

            res.json(productObj)
        } catch (err) {
            res.status(400).json({ error: 'Error al obtener producto' })
            console.log(err)
        }
    },

    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const { code_reference, name, quantity, discount_rate, price, tax_rate, price_includes_tax, unit_measure_id, standard_code_id, is_excluded, tribute_id, withholding_taxes, state } = req.body;
            let update = {
                code_reference,
                name,
                quantity,
                discount_rate,
                price,
                tax_rate,
                price_includes_tax,
                unit_measure_id,
                standard_code_id,
                is_excluded,
                tribute_id,
                withholding_taxes,
                state
            }
            const modifiedProduct = await Product.findByIdAndUpdate(id, update, { new: true })
            res.json(modifiedProduct)
        } catch (err) {
            res.status(400).json({ error: 'Error al actualizar producto' })
            console.log(err)
        }
    },

    deactivateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findByIdAndUpdate(id, { estado: 0 }, { new: true })
            res.json(product)
        } catch (error) {
            res.status(400).json({ error: 'Error al desactivar producto' })
            console.log(error);
        }
    },

    activateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findByIdAndUpdate(id, { estado: 1 }, { new: true })
            res.json(product)
        } catch (error) {
            res.status(400).json({ error: 'Error al activar producto' })
            console.log(error);
        }
    },
}

export default productController;