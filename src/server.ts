import express from "express";
import { connectDatabase } from "./config";
import photosRouter from "./routes/photos";

const server = express();

connectDatabase();
server.use(express.json());

server.use("/api/photos", photosRouter);

export default server;
