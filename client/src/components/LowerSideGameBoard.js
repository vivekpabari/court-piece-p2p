import { useState } from "react"


import UserProfile from "./UserProfile"
import { sortCards } from "../utils/logic"


function LowerSideGameBoard({ playerName, playerSeat, turn, handleMyTurn, cards, trumpSuit, currentHand }) {
    const [myCurrentCards, setMyCurrentCards] = useState(() => {
        console.log("updating cards")
        const updatedCards = sortCards(cards)
        return updatedCards
    })

    const currentHandFirstCard = currentHand.find((card, index) => card !== "" && currentHand.at((index - 1) % 4) === "")
    const currentHandSuit = currentHandFirstCard ? currentHandFirstCard[1] : null
    const allowSuitsForCardDraw = myCurrentCards.find((card) => card[1] === currentHandSuit) ? [currentHandSuit] : ['D', 'C', 'H', 'S']

    const cardClick = (selectedCard) => {
        if (playerSeat === turn && allowSuitsForCardDraw.includes(selectedCard[1])) {
            setMyCurrentCards((cards) => cards.filter((card) => card !== selectedCard))
            handleMyTurn(selectedCard)
        }
    }

    const GetCards = () => {
        return myCurrentCards.map(card => (
            <span className="cardList">
                <img src={process.env.PUBLIC_URL + "/cards/" + card + ".svg"} onClick={() => cardClick(card)} alt="cards" />
            </span>
        ))
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            gap: "7.5em",
            paddingLeft: "12.5em",
        }}>
            <div style={{ alignSelf: "center" }}><UserProfile playerName={playerName} playerSeat={playerSeat} turn={turn} /></div>
            <div>{(playerSeat !== 0 || trumpSuit) && GetCards()}</div>
        </div >
    )
}

export default LowerSideGameBoard