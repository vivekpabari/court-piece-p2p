import { useState } from "react"
import { Col } from "react-bootstrap"

import UserProfile from "./UserProfile"
import { sortCards } from "../utils/logic"
import "../styles/LowerSideGameBoard.css"

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
                <img src={process.env.PUBLIC_URL + "/cards/" + card + ".svg"} onClick={() => cardClick(card)} />
            </span>
        ))
    }

    return (
        <>
            <Col xs="2"><UserProfile playerName={playerName} playerSeat={playerSeat} turn={turn} /></Col>
            <Col>{(playerSeat !== 0 || trumpSuit) && GetCards()}</Col>
        </>
    )
}

export default LowerSideGameBoard