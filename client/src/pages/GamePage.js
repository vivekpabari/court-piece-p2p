import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';


import { socket, onDataSocketEvent } from "../utils/socket";
import { generateRandomID } from '../utils/common';
import { createPeerConnection, createOfferAndSend, addDataChannel } from "../utils/peerconnection";
import GameBoardComponent from "../components/GameBoardComponent";
import RegistrationFormComponent from "../components/RegistrationFormComponent"
import "../styles/gamePage.css";
import CenteredSpinner from "../components/CenteredSpinner";


function GamePage() {
    let { gameId } = useParams();
    const [playerName, setPlayerName] = useState('')
    const [playerId, setPlayerId] = useState()
    const [playerSeat, setPlayerSeat] = useState(0)
    const [otherPlayers, setOtherPlayers] = useState([{}, {}, {}, {}])
    const [playerReady, setPlayerReady] = useState(false)
    const [otherPlayersReady, setOtherPlayersReady] = useState(2)

    const handleOtherPlayersReadyState = () => setOtherPlayersReady((otherPlayersReady) => otherPlayersReady + 1)

    const handleSubmitRegistrationForm = (_playerName, _playerSeat) => {
        setPlayerName(_playerName)
        setPlayerSeat(_playerSeat)
        setPlayerReady(true)
    }

    const getExistingPlayer = async () => {
        const existingOtherPlayers = await new Promise(resolve => {
            socket.on("get_users_details", (data) => {
                resolve(data)
            })
        })
        setOtherPlayers(existingOtherPlayers)
        console.log("received users data")
    }

    useEffect(() => {
        setPlayerId(generateRandomID())
        socket.connect()

        function onConnect() {
            socket.emit("get_users_details", { "game_id": gameId })
        }
        socket.on('connect', onConnect)

        getExistingPlayer()

        return () => {
            socket.off('connect', onConnect);
        };

    }, [])

    useEffect(() => {
        socket.on("join", (newOtherPlayer) => {
            console.log("received join event")
            const peerConnection = createPeerConnection(playerSeat, newOtherPlayer.socket_id, handleOtherPlayersReadyState)
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
            if (playerReady) {
                console.log("sending offer")
                createOfferAndSend(playerSeat, newOtherPlayer.socket_id, peerConnection)
            }
        })
        if (playerReady) {
            console.log("Emiting Join event")
            socket.emit("join", { "player_id": playerId, "player_name": playerName, "player_seat": playerSeat, "game_id": gameId })
        }
        return () => {
            socket.off("join")
        }
    }, [playerReady])

    useEffect(() => {
        const updatedOtherPlayers = otherPlayers.map((player) => {
            if (Object.keys(player).length !== 0) {
                const peerConnection = createPeerConnection(playerSeat, player.socket_id, handleOtherPlayersReadyState)
                const dataChannel = addDataChannel(peerConnection)
                return { ...player, "peerConnection": peerConnection, "dataChannel": dataChannel }
            }
            return { ...player }
        })
        setOtherPlayers(updatedOtherPlayers)
    }, [playerReady])

    useEffect(() => {
        socket.on("data", (data) => onDataSocketEvent(data, playerSeat, otherPlayers))
        return () => { socket.off("data") }
    }, [otherPlayers, playerReady])

    return (
        <div className="game-container">
            {otherPlayersReady === 3 && <GameBoardComponent playerId={playerId} playerName={playerName} playerSeat={playerSeat} gameId={gameId} otherPlayers={otherPlayers}/>}
            {otherPlayersReady < 3 && playerReady && <CenteredSpinner text="Waiting For Other Players" />}
            {otherPlayersReady < 3 && !playerReady && <RegistrationFormComponent handleSubmit={handleSubmitRegistrationForm} otherPlayers={otherPlayers} />}
        </div>
    )

}

export default GamePage