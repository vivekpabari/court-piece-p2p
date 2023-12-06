import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"


import { socket } from "../utils/socket"
import { generateRandomID, validatedPlayerDetails } from '../utils/common'
import GameBoard from "../components/GameBoard"
import RegistrationForm from "../components/RegistrationForm"
import "../styles/gamePage.css"
import CenteredSpinner from "../components/CenteredSpinner"


function GamePage() {
    let { gameId } = useParams()

    const [playerName, setPlayerName] = useState()
    const [playerId, setPlayerId] = useState()
    const [playerSeat, setPlayerSeat] = useState()
    const [otherPlayers, setOtherPlayers] = useState()
    const [playerReady, setPlayerReady] = useState()

    // connecting to socket and fetch existing players.
    useEffect(() => {
        socket.connect()
        if (gameId === localStorage.getItem("gameId")) {
            const validatedLocalStoragePlayerDetails = async () => {
                const isValid = await validatedPlayerDetails(localStorage.getItem("playerId"), localStorage.getItem("playerName"), localStorage.getItem("playerSeat"), localStorage.getItem("gameId"))
                if (isValid === "valid_player_name_and_player_seat") {
                    setPlayerReady(true)
                    setPlayerId(localStorage.getItem("playerId"))
                    setPlayerName(localStorage.getItem("playerName"))
                    setPlayerSeat(parseInt(localStorage.getItem("playerSeat")))
                } else {
                    setPlayerId(generateRandomID())
                }
            }
            validatedLocalStoragePlayerDetails()
        } else {
            setPlayerId(generateRandomID())
        }

        function onConnect() {
            socket.emit("get_users_details", { "game_id": gameId })
        }
        socket.on('connect', onConnect)

        socket.on("get_users_details", (data) => {
            setOtherPlayers(() => data.map(ele => (ele?.player_name ? { ...ele, "polite": true } : ele)))
        })

        return () => {
            socket.off('connect', onConnect)
            socket.off('get_users_details')
        }

    }, [])

    useEffect(() => {
        socket.on("join", (newOtherPlayer) => {
            console.log("received join event")
            const updatedOtherPlayer = (oldOtherPlayers) => oldOtherPlayers.map((otherPlayer, index) => (
                index === newOtherPlayer.player_seat ? {
                    "player_name": newOtherPlayer.player_name,
                    "socket_id": newOtherPlayer.socket_id,
                    "polite": false,
                } : { ...otherPlayer }
            ))
            setOtherPlayers((oldOtherPlayer) => updatedOtherPlayer(oldOtherPlayer))
        })
        return () => {
            socket.off("join")
        }
    }, [playerReady, otherPlayers])

    const handleSubmitRegistrationForm = (_playerName, _playerSeat) => {
        setPlayerName(_playerName)
        setPlayerSeat(_playerSeat)
        setPlayerReady(true)

        localStorage.setItem("playerId", playerId)
        localStorage.setItem("playerName", _playerName)
        localStorage.setItem("playerSeat", _playerSeat)
        localStorage.setItem("gameId", gameId)
    }

    const otherPlayersReady = otherPlayers?.reduce((accumulator, otherPlayer, index) => accumulator + ((Object.keys(otherPlayer).length > 0 && index !== playerSeat) ? 1 : 0), 0)

    return (
        <div className="game-container">
            {otherPlayersReady === 4 && !playerReady && <h1>game room is full</h1>}
            {(otherPlayersReady === 4 || otherPlayersReady === 3) && playerReady && <GameBoard playerId={playerId} playerName={playerName} playerSeat={playerSeat} gameId={gameId} _otherPlayers={otherPlayers} />}
            {otherPlayersReady < 3 && playerReady && <CenteredSpinner text="Waiting For Other Players" />}
            {otherPlayersReady <= 3 && !playerReady && otherPlayers && <RegistrationForm playerId={playerId} gameId={gameId} handleSubmit={handleSubmitRegistrationForm} otherPlayers={otherPlayers} />}
            {otherPlayersReady <= 3 && !playerReady && !otherPlayers && <CenteredSpinner text="Fetching existing Players" />}
        </div>
    )
}

export default GamePage