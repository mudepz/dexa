import { Injectable } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: true,
})
@Injectable()
export class WebsocketService {
    @WebSocketServer()
    server: Server;

    broadcast(event: string, data: any) {
        this.server.emit(event, data);
    }
}