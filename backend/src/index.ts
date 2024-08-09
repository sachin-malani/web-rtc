import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "sender") {
        console.log('Sender');
        
      senderSocket = ws;
    } else if (message.type === "receiver") {
        console.log('Receiver');
      receiverSocket = ws;
    } else if (message.type === "createOffer") {
        
        if(ws !== senderSocket) return;
        console.log('Create Offer');
      receiverSocket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
    } else if (message.type === "createAnswer") {
        console.log('Answer Received 1');

        if(ws !== receiverSocket) return;
        console.log('Answer Received');
      senderSocket?.send(
        JSON.stringify({ type: "createAnswer", sdp: message.sdp })
      );
    } else if( message.type === "iceCandidate") {
        if (ws === senderSocket) 
            receiverSocket?.send(JSON.stringify({type: "iceCandidate", candidate: message.candidate}));
        if (ws === receiverSocket) 
            senderSocket?.send(JSON.stringify({type: "iceCandidate", candidate: message.candidate}));
    }
  });
});
