function convertFaceToInt(str) {
    switch (str) {
        case "T":
            return 10
        case "J":
            return 11
        case "Q":
            return 12
        case "K":
            return 13
        case "A":
            return 14
        default:
            return parseInt(str)
    }
}

export function decideWiner(lastHandWinner, currentHand, trumpSuit) {
    let winerPlayerSeat = lastHandWinner || 0
    let currentPlayerSeat = (winerPlayerSeat + 1) % 4
    for (let i = 0; i < 3; i++) {
        if (currentHand[winerPlayerSeat][1] === currentHand[currentPlayerSeat][1]) {
            if (convertFaceToInt(currentHand[currentPlayerSeat][0]) > convertFaceToInt(currentHand[winerPlayerSeat][0])) {
                winerPlayerSeat = currentPlayerSeat
            }
        } else if (currentHand[currentPlayerSeat][1] === trumpSuit) {
            winerPlayerSeat = currentPlayerSeat
        }
        currentPlayerSeat = (currentPlayerSeat + 1) % 4
    }
    return winerPlayerSeat
}