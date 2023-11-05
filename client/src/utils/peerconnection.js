import { socket } from "./socket"

let onIceCandidate = (event, sender_seat, receiver_socket_id) => {
    console.log("sending candidate")
    if (event.candidate) {
        const data = {
            "type": "candidate",
            'candidate': event.candidate
        }
        socket.emit("data", { "sender_seat": sender_seat, "data": data, "to": receiver_socket_id });
    }
}

export function createPeerConnection(sender_seat, receiver_socket_id, handleOtherPlayersReadyState) {
    // list of stun & turn servers
    const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnection.onicecandidate = (event) => onIceCandidate(event, sender_seat, receiver_socket_id);
    peerConnection.addEventListener('connectionstatechange', event => {
        console.log(peerConnection.connectionState)
        handleOtherPlayersReadyState(peerConnection.connectionState)
    });
    return peerConnection;
}

export async function createOfferAndSend(sender_seat, receiver_socket_id, peerConnection) {
    try {
        const localOffer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(localOffer)
        socket.emit("data", { "sender_seat": sender_seat, "data": localOffer, "to": receiver_socket_id });
    } catch (err) {
        console.log("error while sending offer")
    }
}

export function addDataChannel(dataChannelName, incomingplayerSeat, peerConnection, handleIncomingMessage, handleOpenDataChannel, handleCloseDataChannel) {
    const dataChannelConfigurations = {
        orderer: true,
    }
    const dataChannel = peerConnection.createDataChannel(dataChannelName, dataChannelConfigurations);
    peerConnection.ondatachannel = (ev) => {
        const receiveChannel = ev.channel
        receiveChannel.onmessage = (event) => handleIncomingMessage(event.data, incomingplayerSeat)
        receiveChannel.onopen = () => handleOpenDataChannel(incomingplayerSeat)
        receiveChannel.onclose = () => handleCloseDataChannel(incomingplayerSeat)
    };
    return dataChannel
}

export function sendAll(otherPlayers, payload) {
    console.log("sending payload to all players using datachannel")
    otherPlayers.forEach(otherPlayer => {
        if ("dataChannel" in otherPlayer) {
            otherPlayer.dataChannel.send(JSON.stringify(payload))
        }
    });
}
