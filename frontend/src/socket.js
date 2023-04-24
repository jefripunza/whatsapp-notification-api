import { io } from "socket.io-client";
import { URL } from "./config";

export const socket = io(URL);
