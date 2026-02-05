import server from "./server";
import colors from "colors";

const port = process.env.SERVER_PORT;

server.listen(port, () => {
  console.log(colors.green.italic.bold("Servidor conectado exitosamente!"));
});
