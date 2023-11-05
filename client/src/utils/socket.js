import { io } from 'socket.io-client';

const URL = 'http://localhost:5001';
export const socket = io(URL, {
    autoConnect: false
});

export async function onDataSocketEvent(payload, playerSeat, otherPlayers) {
    try {
        const sender_seat = payload.sender_seat
        const data = payload.data
        const peerConnection = otherPlayers[sender_seat].peerConnection
        if (data.type === "offer") {
            console.log("sending answer")
            const remoteOffer = new RTCSessionDescription(data);
            peerConnection.setRemoteDescription(remoteOffer);
            const localAnswer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(localAnswer);
            socket.emit("data", { "sender_seat": playerSeat, "data": localAnswer, "to": otherPlayers[sender_seat].socket_id });
        } else if (data.type === "answer") {
            console.log("receiving answer")
            const remoteDesc = new RTCSessionDescription(data);
            await peerConnection.setRemoteDescription(remoteDesc);
        } else if (data.type === "candidate") {
            console.log("receiving cadidate")
            await peerConnection.addIceCandidate(data.candidate);
        }
    } catch(err) {
        console.log("error on data event: ", err)
    }
}