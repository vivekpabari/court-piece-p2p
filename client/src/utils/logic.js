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

// D C H S Sequence of suit
export function sortCards(cards) {
    for (let i = 0; i < cards.length - 1; i++) {
        let isSwap = false
        for (let j = i + 1; j < cards.length; j++) {
            if ((cards[i][1] === cards[j][1] && convertFaceToInt(cards[i][0]) > convertFaceToInt(cards[j][0]))
                || (cards[i][1] !== cards[j][1] && (cards[i][1] === "S"
                    || (cards[i][1] === "H" && (cards[j][1] === "C" || cards[j][1] === "D"))
                    || (cards[i][1] === "C" && cards[j][1] === "D")))
            ) {
                [cards[i], cards[j]] = [cards[j], cards[i]]
                isSwap = true
            }
        }
        if (!isSwap) {
            break
        }
    }
    return cards
}
