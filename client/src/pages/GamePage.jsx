import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';


import { socket, generateRandomID, createPeerConnection, createOfferAndSend, addDataChannel } from "../utils";

function GamePage() {
    let { gameId } = useParams();
    const [openModel, setOpenModel] = useState(true);
    const [playerName, setPlayerName] = useState('');
    const [playerId, setPlayerId] = useState();
    const [playerSeat, setPlayerSeat] = useState(0);
    const [otherPlayers, setOtherPlayers] = useState([{}, {}, {}, {}]);
    const [ready, setReady] = useState(false);

    const playerNameRef = useRef(null)
    const playerSeatRef = useRef(null)

    const handleSubmitPlayerDetails = (event) => {
        console.log("Modal Closed")
        event.preventDefault()
        setPlayerName(playerNameRef.current.value)
        setPlayerSeat(playerSeatRef.current.value)
        setOpenModel(false)
    }

    useEffect(() => {
        setPlayerId(generateRandomID())
        socket.connect()

        function onConnect() {
            socket.emit("get_users_details", { "game_id": gameId })
        }
        socket.on('connect', onConnect)

        const getExistingPlayer = async () => {
            const existingOtherPlayers = await new Promise(resolve => {
                socket.on("get_users_details", (data) => {
                    resolve(data)
                })
            })
            setOtherPlayers(existingOtherPlayers)
            console.log("received users data")
        }
        getExistingPlayer()

        return () => {
            socket.off('connect', onConnect);
        };

    }, [])

    useEffect(() => {
        const updatedOtherPlayers = otherPlayers.map((player) => {
            if (Object.keys(player).length !== 0) {
                const peerConnection = createPeerConnection(playerSeat, player.socket_id)
                const dataChannel = addDataChannel(peerConnection)
                return { ...player, "peerConnection": peerConnection, "dataChannel": dataChannel }
            }
            return { ...player }
        })
        setOtherPlayers(updatedOtherPlayers)
    }, [playerSeat])

    useEffect(() => {
        socket.on("join", (newOtherPlayer) => {
            console.log("received join event")
            const peerConnection = createPeerConnection(playerSeat, newOtherPlayer.socket_id)
            const dataChannel = addDataChannel(peerConnection)
            const updatedOtherPlayer = otherPlayers.map((otherPlayer, index) => (
                index === newOtherPlayer.player_seat ? {
                    "player_name": newOtherPlayer.player_name,
                    "socket_id": newOtherPlayer.socket_id,
                    "peerConnection": peerConnection,
                    "dataChannel": dataChannel
                } : { ...otherPlayer }
            ))
            setOtherPlayers(updatedOtherPlayer)
            if (!openModel) {
                console.log("sending offer")
                createOfferAndSend(playerSeat, newOtherPlayer.socket_id, peerConnection)
            }
        })
        if (!openModel) {
            console.log("Emiting Join event")
            socket.emit("join", { "player_id": playerId, "player_name": playerName, "player_seat": playerSeat, "game_id": gameId })
        }
        return () => {
            socket.off("join")
        }
    }, [openModel])

    useEffect(() => {
        async function onData(payload) {
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
        }
        socket.on("data", (data) => onData(data))

        return () => { socket.off("data") }
    }, [otherPlayers, playerSeat])

    const SelectSeat = () => {
        let options
        if (Object.keys(otherPlayers[0]).length === 0) {
            options = <option value="0">No options1</option>
        } else if (Object.keys(otherPlayers[1]).length === 0) {
            options = Object.keys(otherPlayers[2]).length === 0
                ? (
                    <>
                        <option value="2">{otherPlayers[0].player_name}</option>
                        <option value="1">Play with other Player</option>
                    </>
                ) : (<option value="1">No options2</option>)
        } else if (Object.keys(otherPlayers[2]).length === 0) {

            options = Object.keys(otherPlayers[3]).length === 0 ? (
                <>
                    <option value="2">{otherPlayers[0].player_name}</option>
                    <option value="3">{otherPlayers[1].player_name}</option>
                </>
            ) : (<option value="2">No options2</option>)

        } else {
            options = <option value="3">No options3</option>
        }
        return (
            <Form.Select ref={playerSeatRef} aria-label="Select Teammate">
                {options}
            </Form.Select>
        )
    }

    return (
        <>
            <div>
                <Modal show={openModel} centered>
                    <Modal.Body>
                        <Form onSubmit={handleSubmitPlayerDetails}>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    type="text"
                                    id="playerName"
                                    placeholder="Enter name"
                                    ref={playerNameRef}
                                />
                                <SelectSeat />
                                <Button type="submit" variant="primary">Start</Button>
                            </InputGroup>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    )
}

export default GamePage