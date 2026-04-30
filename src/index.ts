import server from "./server";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();

const port = process.env.SERVER_PORT;

server.listen(port, async () => {
  console.log(colors.green.italic.bold("Servidor conectado exitosamente!"));
  console.log(colors.yellow("→ Para resetear la BD usa: npm run reset-db"));
});