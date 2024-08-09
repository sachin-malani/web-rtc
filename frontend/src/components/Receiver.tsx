// import { useEffect } from "react";

// const Receiver = () => {
//   useEffect(() => {
//     const socket = new WebSocket("ws://localhost:8080");
//     socket.onopen = () => {
//       socket.send(JSON.stringify({ type: "receiver" }));
//     };

//     socket.onmessage = async (event) => {
//       const message = JSON.parse(event.data);
//       let pc: RTCPeerConnection | null = null;
//       if (message.type === "createOffer") {
//         pc = new RTCPeerConnection();
//         pc.setRemoteDescription(message.sdp);

//         pc.onicecandidate = (event) => {
//           console.log(event.candidate);
//           if (event.candidate) {
//             socket.send(
//               JSON.stringify({
//                 type: "iceCandidate",
//                 candidate: event.candidate,
//               })
//             );
//           }
//         };

//         pc.ontrack = (event) => {
//           const video = document.createElement("video");
//           document.body.appendChild(video);
//           video.srcObject = new MediaStream([event.track]);
//           video.play();
//         };

//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         socket.send(
//           JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
//         );
//       } else if (message.type === "iceCandidate") {
//         if (pc !== null) {
//           //@ts-ignore
//           pc?.addIceCandidate(message.candidate);
//         }
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <p>Receiver</p>
//       {/* <video ref={videoRef} autoPlay></video> */}
//     </div>
//   );
// };



import { useEffect } from "react"


 const Receiver = () => {
    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);
    }, []);

    function startReceiving(socket: WebSocket) {
        const video = document.createElement('video');
        document.body.appendChild(video);

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            video.srcObject = new MediaStream([event.track]);
            video.controls = true;
            setTimeout(() => {
                video.play();
            }, 1000)
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }
    }

    return <div>
        
    </div>
}
export default Receiver;
