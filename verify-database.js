// verify-database.js
// Ejecuta este script en tu backend para verificar qué clientes tienes en tu base de datos

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const customerSchema = new mongoose.Schema({
    identification: { type: String, required: true },
    dv: { type: String },
    company: { type: String },
    trade_name: { type: String },
    names: { type: String },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    legal_organization_id: { type: String, required: true },
    tribute_id: { type: String, required: true },
    identification_document_id: { type: String, required: true },
    municipality_id: { type: String, required: true },
    state: { type: Number, default: 1 },
}, {
    timestamps: true
});

const Customer = mongoose.model("Clientes", customerSchema);

async function verifyDatabase() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        console.log('📍 URL de conexión:', process.env.CNX_MONGO);
        
        await mongoose.connect(process.env.CNX_MONGO);
        console.log('✅ Conectado a MongoDB');

        // Verificar colecciones existentes
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📂 Colecciones en la base de datos:');
        collections.forEach(col => console.log(`  - ${col.name}`));

        // Contar documentos en la colección de clientes
        const customerCount = await Customer.countDocuments();
        console.log(`\n👥 Total de clientes en la base de datos: ${customerCount}`);

        if (customerCount > 0) {
            // Mostrar algunos clientes de ejemplo
            const sampleCustomers = await Customer.find().limit(5).lean();
            console.log('\n📋 Primeros 5 clientes:');
            sampleCustomers.forEach((customer, index) => {
                console.log(`\n${index + 1}. Cliente ID: ${customer._id}`);
                console.log(`   Identificación: ${customer.identification}`);
                console.log(`   Nombre: ${customer.company || customer.names}`);
                console.log(`   Email: ${customer.email}`);
                console.log(`   Estado: ${customer.state === 1 ? 'Activo' : 'Inactivo'}`);
                console.log(`   Creado: ${customer.createdAt}`);
            });

            // Verificar si hay clientes con datos que parezcan de Factus
            const possibleFactusCustomers = await Customer.find({
                $or: [
                    { email: { $regex: /factus/i } },
                    { company: { $regex: /factus/i } },
                    { names: { $regex: /factus/i } }
                ]
            }).lean();

            if (possibleFactusCustomers.length > 0) {
                console.log(`\n⚠️  Se encontraron ${possibleFactusCustomers.length} clientes que podrían ser de Factus:`);
                possibleFactusCustomers.forEach(customer => {
                    console.log(`   - ${customer.company || customer.names} (${customer.email})`);
                });
            } else {
                console.log('\n✅ No se encontraron clientes que parezcan ser de Factus');
            }
        } else {
            console.log('\n📭 No hay clientes en la base de datos');
            console.log('💡 Esto explicaría por qué no ves clientes locales en el frontend');
        }

    } catch (error) {
        console.error('❌ Error al verificar la base de datos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de la base de datos');
        process.exit(0);
    }
}

verifyDatabase();