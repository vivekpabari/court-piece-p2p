import { useRef, useState } from "react"

import '../styles/RegistrationForm.css'  // Import your CSS file

import { socket } from "../utils/socket"
import { validatedPlayerDetails } from "../utils/common"

function RegistrationForm({ playerId, gameId, otherPlayers, handleSubmit }) {
    const playerNameRef = useRef(null)
    const playerSeatRef = useRef(null)
    const [errorPlayerName, setErrorPlayerName] = useState(false)
    const [errorPlayerSeat, setErrorPlayerSeat] = useState(false)
    const [validated, setValidated] = useState(false)

    const handleSubmitPlayerDetails = async (event) => {
        console.log("Form submitted")
        event.preventDefault()
        const isValid = await validatedPlayerDetails(playerId, playerNameRef.current.value, playerSeatRef.current.value, gameId)
        if (isValid === "valid_player_name_and_player_seat") {
            handleSubmit(playerNameRef.current.value, parseInt(playerSeatRef.current.value))
            setValidated(true)
        } else {
            if (isValid === "invalid_player_name") {
                setErrorPlayerName(true)
            } else {
                setErrorPlayerSeat(true)
            }
            setValidated(false)
            socket.emit("get_users_details", { "game_id": gameId })
        }
    }

    const getOptions = () => {
        let options
        if (Object.keys(otherPlayers[0]).length === 0) {
            options = <option value="0">No options</option>
        } else if (Object.keys(otherPlayers[1]).length === 0) {
            options = Object.keys(otherPlayers[2]).length === 0
                ? (
                    <>
                        <option value="2">{otherPlayers[0].player_name}</option>
                        <option value="1">Play with other Player</option>
                    </>
                ) : (<option value="1">No options</option>)
        } else if (Object.keys(otherPlayers[2]).length === 0) {
            options = Object.keys(otherPlayers[3]).length === 0 ? (
                <>
                    <option value="2">{otherPlayers[0].player_name}</option>
                    <option value="3">{otherPlayers[1].player_name}</option>
                </>
            ) : (<option value="2">{otherPlayers[0].player_name}</option>)
        } else {
            options = <option value="3">{otherPlayers[1].player_name}</option>
        }
        return options
    }

    return (
        <div className="registration-container">
            <div className="registration-form">
                <form onSubmit={handleSubmitPlayerDetails}>
                    {errorPlayerName && <div className="alert alert-danger">Player Name already taken</div>}
                    {errorPlayerSeat && <div className="alert alert-danger">Player Seat already taken</div>}
                    <div className="mb-3">
                        <label className="text-white text-center lead">What is your name?</label>
                        <input ref={playerNameRef} type="text" className="registration-form-control" placeholder="Enter name" />
                    </div>
                    <div className="mb-3">
                        <label className="text-white lead">Select your teammate</label>
                        <select ref={playerSeatRef} className="registration-form-select">
                            {getOptions()}
                        </select>
                    </div>
                    <button className="registration-form-btn-primary" type="submit">
                        Join Game!
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RegistrationForm
