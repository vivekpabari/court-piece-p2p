import { socket } from "./socket"

export const generateRandomID = () => Math.random().toString(36).substring(2)

export const validatedPlayerDetails = (_playerId, _playerName, _playerSeat, gameId) => {
    return new Promise(resolve => {
        socket.emit("join", {
            "player_id": _playerId,
            "player_name": _playerName,
            "player_seat": _playerSeat,
            "game_id": gameId
        }, (response) => {
            console.log(response)
            resolve(response)
        })
    })
}
