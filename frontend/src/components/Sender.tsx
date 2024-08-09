import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(socket);
  }, []);

  const startVideo = async () => {
    if (!socket) return;
    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
      );
    };

    pc.onicecandidate = (event) => {
      console.log(event.candidate);
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        pc.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        pc.addIceCandidate(message.candidate);
      }
    };
    //ScreenShare
    // const screen = await navigator.mediaDevices.getDisplayMedia({
    //     video: true,
    //     audio: false,
    //   });
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    pc.addTrack(stream.getVideoTracks()[0]);
    // pc.addTrack(stream.getAudioTracks()[0]);
    const video = document.createElement("video");
    document.body.appendChild(video);
    video.srcObject = stream;
    video.play();
  };

  return (
    <div>
      <button onClick={startVideo}>Send Video</button>
    </div>
  );
};

export default Sender;
