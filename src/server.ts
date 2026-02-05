import express from "express";
import { connectDatabase } from "./config";

const server = express();

connectDatabase();
server.use(express.json());

export default server;
