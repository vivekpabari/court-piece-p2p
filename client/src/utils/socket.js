import { io } from 'socket.io-client'


import { makingOfferList } from "./peerconnection"

const URL = process.env.NODE_ENV === 'production' ? "https://signalling-server-ahxq.onrender.com" : 'http://localhost:8000'

export const socket = io(URL, {
    autoConnect: false
});

export async function onDataSocketEvent(payload, playerSeat, otherPlayers) {
    try {
        const sender_seat = payload.sender_seat
        const data = payload.data
        const peerConnection = otherPlayers[sender_seat].peerConnection
        console.log("received data from socket from ", sender_seat)
        if (payload.sender_socket_id !== otherPlayers[sender_seat].socket_id) {
            console.log("rejecting data from socket")
            return
        }
        if (data.type === "candidate") {
            console.log("receiving cadidate")
            await peerConnection.addIceCandidate(data.candidate)
        } else {
            const offerCollision =
                data.type === "offer" &&
                (makingOfferList[sender_seat] || peerConnection.signalingState !== "stable")

            console.log(otherPlayers)
            const polite = otherPlayers[sender_seat]?.polite
            console.log("offerCollision:", offerCollision, "polite: ", polite, "sender_seat:", sender_seat, data.type)
            const ignoreOffer = !polite && offerCollision
            if (ignoreOffer) {
                console.log("ignoring offer")
                return
            }

            await peerConnection.setRemoteDescription(data)
            if (data.type === "offer") {
                console.log("sending answer")
                await peerConnection.setLocalDescription()
                socket.emit("data", { "sender_seat": playerSeat, "data": peerConnection.localDescription, "to": otherPlayers[sender_seat].socket_id })
            }
        }
    } catch (err) {
        console.log("error on data event for:", payload.sender_seat, "| error: ", err)
    }
}