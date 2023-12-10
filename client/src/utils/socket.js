import { io } from 'socket.io-client'


import { makingOfferList, srdAnswerPendingList } from "./peerconnection"

const URL = process.env.NODE_ENV === 'production' ? "https://signalling-server-ahxq.onrender.com" : 'http://localhost:8000'

export const socket = io(URL, {
    autoConnect: false
});

export async function onDataSocketEvent(payload, playerSeat, otherPlayers, callback) {
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
            // If we have a setRemoteDescription() answer operation pending, then
            // we will be "stable" by the time the next setRemoteDescription() is
            // executed, so we count this being stable when deciding whether to
            // ignore the offer.
            const polite = otherPlayers[sender_seat]?.polite
            const isStable =
                peerConnection.signalingState === 'stable' ||
                (peerConnection.signalingState === 'have-local-offer' && srdAnswerPendingList[sender_seat])
            const ignoreOffer =
                data.type === 'offer' && !polite && (makingOfferList[sender_seat] || !isStable)
            if (ignoreOffer) {
                console.log("ignoring offer")
                return
            }

            srdAnswerPendingList[sender_seat] = data.type === 'answer'
            await peerConnection.setRemoteDescription(data)
            srdAnswerPendingList[sender_seat] = false

            if (data.type === "offer") {
                console.log("sending answer")
                await peerConnection.setLocalDescription()
                socket.emit("data", { "sender_seat": playerSeat, "data": peerConnection.localDescription, "to": otherPlayers[sender_seat].socket_id })
            }
        }
    } catch (err) {
        console.log("error on data event for:", payload.sender_seat, "| error: ", err)
    } finally {
        callback(true)
    }
}