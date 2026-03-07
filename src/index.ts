import server from "./server";
import dotenv from "dotenv";
import colors from "colors";

const port = process.env.SERVER_PORT;
dotenv.config();

server.listen(port, () => {
  console.log(colors.green.italic.bold("Servidor conectado exitosamente!"));
});
