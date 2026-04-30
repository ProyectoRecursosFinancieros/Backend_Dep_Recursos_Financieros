// src/seeds/resetDatabase.ts
import { sequelize } from "../config/db";
import { Area } from "../models/Area";
import { Usuario } from "../models/Usuario";
import bcrypt from "bcrypt";

const hashedPassword = bcrypt.hashSync("123456", 10);

export const resetDatabase = async () => {
    console.log("🔥 Iniciando RESET COMPLETO de la base de datos...");

    try {

        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");


        console.log("   → Eliminando tablas...");
        await sequelize.query("DROP TABLE IF EXISTS `ordenes_pago`;");
        await sequelize.query("DROP TABLE IF EXISTS `ordenes_compra`;");
        await sequelize.query("DROP TABLE IF EXISTS `requisicion_detalles`;");
        await sequelize.query("DROP TABLE IF EXISTS `requisiciones`;");
        await sequelize.query("DROP TABLE IF EXISTS `solicitudes`;");
        await sequelize.query("DROP TABLE IF EXISTS `presupuestos_anuales`;");
        await sequelize.query("DROP TABLE IF EXISTS `usuarios`;");
        await sequelize.query("DROP TABLE IF EXISTS `proveedores`;");
        await sequelize.query("DROP TABLE IF EXISTS `partidas_presupuestales`;");
        await sequelize.query("DROP TABLE IF EXISTS `areas`;");

        console.log("✅ Todas las tablas eliminadas");


        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");


        await sequelize.sync({ force: false });
        console.log("✅ Tablas recreadas correctamente");


        const [areaAdmin] = await Area.findOrCreate({
            where: { nombre: "Dirección General" },
            defaults: { descripcion: "Área administrativa principal" }
        });

        await Usuario.create({
            nombre: "Administrador General",
            email: "admin@upqroo.edu.mx",
            password: hashedPassword,
            rol: "ADMIN",
            areaId: areaAdmin.id,
            activo: true
        });

        console.log("✅ RESET COMPLETO FINALIZADO 🎉");
        console.log("\n👤 Usuario administrador:");
        console.log("   Email:    admin@upqroo.edu.mx");
        console.log("   Password: 123456");
        console.log("   Rol:      ADMIN\n");

    } catch (error: any) {
        console.error("❌ Error durante el reset:", error.message);
        throw error;
    }
};

// Ejecutar directamente si se llama desde consola
if (require.main === module) {
    resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}