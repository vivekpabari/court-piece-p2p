import { io } from 'socket.io-client';

const URL = 'http://localhost:5001';
export const socket = io(URL, {
    autoConnect: false
});

export const generateRandomID = () => Math.random().toString(36).substring(2)

let onIceCandidate = (event, sender_seat, receiver_socket_id) => {
    console.log("sending candidate")
    if (event.candidate) {
        const data = {
            "type": "candidate",
            'candidate': event.candidate
        }
        console.log({ "sender_seat": sender_seat, "data": data, "to": receiver_socket_id })
        socket.emit("data", { "sender_seat": sender_seat, "data": data, "to": receiver_socket_id });
    }
}

export function createPeerConnection(sender_seat, receiver_socket_id) {
    // list of stun & turn servers
    const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnection.onicecandidate = (event) => onIceCandidate(event, sender_seat, receiver_socket_id);
    peerConnection.addEventListener('connectionstatechange', event => {
        console.log(peerConnection.connectionState)
    });
    return peerConnection;
}

export async function createOfferAndSend(sender_seat, receiver_socket_id, peerConnection) {
    const localOffer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(localOffer)
    socket.emit("data", { "sender_seat": sender_seat, "data": localOffer, "to": receiver_socket_id });
}

const handleIncomingMessage = event => {
    console.log("Message Received through data channel")
    console.log(event.data)
};


export function addDataChannel(peerConnection) {

    const dataChannelConfigurations = {
        orderer: true,
    }

    const dataChannel = peerConnection.createDataChannel("testDataChannel", dataChannelConfigurations);

    peerConnection.ondatachannel = (ev) => {
        const receiveChannel = ev.channel;
        receiveChannel.onmessage = handleIncomingMessage;
        receiveChannel.onopen = () => console.log("connection opened");
        receiveChannel.onclose = () => console.log("connection close");
    };

    return dataChannel
}



