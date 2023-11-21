import { useState } from "react"
import { Col } from "react-bootstrap"

import UserProfile from "./UserProfile"
import { sortCards } from "../utils/logic"
import "../styles/LowerSideGameBoard.css"

function LowerSideGameBoard({ playerName, playerSeat, turn, handleMyTurn, cards, trumpSuit }) {
    const [myCurrentCards, setMyCurrentCards] = useState(sortCards(cards))

    const cardClick = (Selectedcard) => {
        if (playerSeat === turn) {
            setMyCurrentCards((cards) => cards.filter((card) => card !== Selectedcard))
            handleMyTurn(Selectedcard)
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
            <Col>{trumpSuit && GetCards()}</Col>
        </>
    )
}

export default LowerSideGameBoard