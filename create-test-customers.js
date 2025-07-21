// create-test-customers.js
// Crear algunos clientes de prueba en tu base de datos local

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

const testCustomers = [
    {
        identification: "12345678",
        dv: "9",
        company: "Empresa de Prueba S.A.S",
        trade_name: "Prueba Comercial",
        names: "",
        address: "Calle 123 #45-67",
        email: "empresa@prueba.com",
        phone: "3001234567",
        legal_organization_id: "1", // Empresa
        tribute_id: "18", // IVA
        identification_document_id: "6", // NIT
        municipality_id: "11001", // Bogotá
        state: 1
    },
    {
        identification: "87654321",
        dv: "",
        company: "",
        trade_name: "",
        names: "Juan Carlos Pérez García",
        address: "Carrera 45 #23-12",
        email: "juan.perez@email.com",
        phone: "3009876543",
        legal_organization_id: "2", // Persona natural
        tribute_id: "21", // Exento
        identification_document_id: "3", // CC
        municipality_id: "5001", // Medellín
        state: 1
    },
    {
        identification: "11223344",
        dv: "5",
        company: "Tech Solutions Ltda",
        trade_name: "TechSol",
        names: "",
        address: "Avenida 68 #12-34",
        email: "info@techsolutions.com",
        phone: "3015678901",
        legal_organization_id: "1", // Empresa
        tribute_id: "18", // IVA
        identification_document_id: "6", // NIT
        municipality_id: "76001", // Cali
        state: 1
    },
    {
        identification: "55667788",
        dv: "",
        company: "",
        trade_name: "",
        names: "María Fernanda López Ruiz",
        address: "Calle 50 #30-15",
        email: "maria.lopez@gmail.com",
        phone: "3012345678",
        legal_organization_id: "2", // Persona natural
        tribute_id: "21", // Exento
        identification_document_id: "3", // CC
        municipality_id: "11001", // Bogotá
        state: 1
    },
    {
        identification: "99887766",
        dv: "3",
        company: "Servicios Integrales S.A.S",
        trade_name: "ServiIntegrales",
        names: "",
        address: "Transversal 15 #67-89",
        email: "contacto@serviciosintegrales.co",
        phone: "3018765432",
        legal_organization_id: "1", // Empresa
        tribute_id: "18", // IVA
        identification_document_id: "6", // NIT
        municipality_id: "5001", // Medellín
        state: 0 // Inactivo para probar filtros
    }
];

async function createTestCustomers() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await mongoose.connect(process.env.CNX_MONGO);
        console.log('✅ Conectado a MongoDB');

        console.log(`\n📝 Creando ${testCustomers.length} clientes de prueba...`);

        // Limpiar clientes existentes (opcional)
        const existingCount = await Customer.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Ya existen ${existingCount} clientes. ¿Deseas continuar? (Se agregarán más)`);
        }

        // Crear clientes uno por uno para manejar duplicados
        let created = 0;
        let skipped = 0;

        for (const customerData of testCustomers) {
            try {
                const newCustomer = new Customer(customerData);
                await newCustomer.save();
                created++;
                console.log(`✅ Cliente creado: ${customerData.company || customerData.names} (${customerData.email})`);
            } catch (error) {
                if (error.code === 11000) { // Duplicate key error
                    console.log(`⚠️  Cliente ya existe: ${customerData.email} - Saltando...`);
                    skipped++;
                } else {
                    console.error(`❌ Error creando cliente ${customerData.email}:`, error.message);
                }
            }
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   ✅ Clientes creados: ${created}`);
        console.log(`   ⚠️  Clientes saltados (ya existían): ${skipped}`);

        // Verificar el total final
        const finalCount = await Customer.countDocuments();
        console.log(`   📈 Total de clientes en la base de datos: ${finalCount}`);

        // Mostrar algunos clientes para confirmar
        console.log(`\n👥 Clientes en la base de datos:`);
        const allCustomers = await Customer.find().lean();
        allCustomers.forEach((customer, index) => {
            console.log(`${index + 1}. ${customer.company || customer.names} - ${customer.email} (${customer.state === 1 ? 'Activo' : 'Inactivo'})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de la base de datos');
        process.exit(0);
    }
}

createTestCustomers();