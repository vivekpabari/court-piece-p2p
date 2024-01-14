import { socket } from "./socket"

export const makingOfferList = [false, false, false, false]
export const srdAnswerPendingList = [false, false, false, false]

const onIceCandidate = (event, sender_seat, receiver_socket_id) => {
    console.log("sending candidate")
    if (event.candidate) {
        const data = {
            "type": "candidate",
            "candidate": event.candidate
        }
        socket.emit("data", { "sender_seat": sender_seat, "data": data, "to": receiver_socket_id })
    }
}

export function createPeerConnection(sender_seat, receiverPlayerSeat, receiverSocketId, handleOtherPlayersReadyState) {
    // list of stun & turn servers
    const configuration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" }
        ],
    }
    const peerConnection = new RTCPeerConnection(configuration)
    peerConnection.onicecandidate = (event) => onIceCandidate(event, sender_seat, receiverSocketId)
    peerConnection.oniceconnectionstatechange = () => {
        console.log(peerConnection.iceConnectionState, receiverPlayerSeat)
        if (peerConnection.iceConnectionState === "failed") {
            console.log("restarting ICE")
            peerConnection.restartIce()
        }
        if (peerConnection.iceConnectionState === "disconnected") {
            setTimeout(() => {
                if (peerConnection.iceConnectionState === "disconnected") {
                    console.log("restarting ICE")
                    peerConnection.restartIce()
                }
            }, 5000)
        }
    }
    peerConnection.onconnectionstatechange = event => {
        console.log(peerConnection.connectionState)
        handleOtherPlayersReadyState(peerConnection.connectionState, receiverPlayerSeat)
    }
    peerConnection.onnegotiationneeded = () => createOfferAndSend(sender_seat, receiverPlayerSeat, receiverSocketId, peerConnection)
    return peerConnection
}

async function createOfferAndSend(sender_seat, receiverPlayerSeat, receiverSocketId, peerConnection) {
    try {
        console.log("Creating offer and sending to: ", receiverPlayerSeat)
        makingOfferList[receiverPlayerSeat] = true
        await peerConnection.setLocalDescription()
        socket.emit("data", { "sender_seat": sender_seat, "data": peerConnection.localDescription, "to": receiverSocketId })
    } catch (err) {
        console.log("error while sending offer: ", err)
    } finally {
        makingOfferList[receiverPlayerSeat] = false
    }
}

export function addDataChannel(dataChannelName, incomingplayerSeat, peerConnection, handleIncomingMessage, handleOpenDataChannel, handleCloseDataChannel) {
    const dataChannelConfigurations = {
        orderer: true,
    }
    const dataChannel = peerConnection.createDataChannel(dataChannelName, dataChannelConfigurations)
    peerConnection.ondatachannel = (ev) => {
        const receiveChannel = ev.channel
        receiveChannel.onmessage = (event) => handleIncomingMessage(event.data, incomingplayerSeat)
        receiveChannel.onopen = () => handleOpenDataChannel(incomingplayerSeat)
        receiveChannel.onclose = () => handleCloseDataChannel(incomingplayerSeat)
    }
    return dataChannel
}

export function sendAll(otherPlayers, payload) {
    console.log("sending payload to all players using datachannel")
    otherPlayers.forEach(otherPlayer => {
        if ("dataChannel" in otherPlayer) {
            otherPlayer.dataChannel.send(JSON.stringify(payload))
        }
    })
}
