import { socket } from "./socket"

export const generateRandomID = () => Math.random().toString(36).substring(2)

export const validatedPlayerDetails = (_playerId, _playerName, _playerSeat, gameId) => {
    socket.emit("join", {
        "player_id": _playerId,
        "player_name": _playerName,
        "player_seat": _playerSeat,
        "game_id": gameId
    })
    return new Promise(resolve => {
        socket.on("valid_player_name_and_player_seat", () => {
            console.log("valid player name and seat")
            resolve("valid_player_name_and_player_seat")
        })
        socket.on("invalid_player_name", () => {
            console.log("Invalid player name")
            resolve("invalid_player_name")
        })
        socket.on("invalid_player_seat", () => {
            console.log("Invalid player seat")
            resolve("invalid_player_seat")
        })
    })
}
