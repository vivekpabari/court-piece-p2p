import { useState } from "react"


import UserProfile from "./UserProfile"
import { sortCards } from "../utils/logic"


function LowerSideGameBoard({ playerName, playerSeat, turn, handleMyTurn, cards, trumpSuit, currentHand }) {
    const [myCurrentCards, setMyCurrentCards] = useState(() => {
        console.log("updating cards")
        const updatedCards = sortCards(cards)
        return updatedCards
    })
    const [selectedCard, setSelectedCard] = useState()

    const currentHandFirstCard = currentHand.find((card, index) => card !== "" && currentHand.at((index - 1) % 4) === "")
    const currentHandSuit = currentHandFirstCard ? currentHandFirstCard[1] : null
    const allowSuitsForCardDraw = myCurrentCards.find((card) => card[1] === currentHandSuit) ? [currentHandSuit] : ['D', 'C', 'H', 'S']

    const handleCardClick = (_selectedCard) => {
        if (playerSeat === turn && allowSuitsForCardDraw.includes(_selectedCard[1])) {
            if (selectedCard === _selectedCard) {
                setMyCurrentCards((cards) => cards.filter((card) => card !== _selectedCard))
                handleMyTurn(_selectedCard)
            } else {
                setSelectedCard(() => _selectedCard)
            }
        }
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
            <div style={{
                display: "flex"
            }}
            >
                {
                    (playerSeat !== 0 || trumpSuit)
                    && myCurrentCards.map(card =>
                        <div
                            className="cardList"
                            key={card}
                            style={{
                                paddingTop: card === selectedCard ? "0px" : "20px",
                                paddingBottom: card === selectedCard && "20px",
                            }}
                        >
                            <div
                                style={{
                                    backgroundImage: `url(${process.env.PUBLIC_URL}/cards/${card}.svg)`,
                                    backgroundSize: "contain",
                                    boxShadow: !allowSuitsForCardDraw.includes(card[1]) && playerSeat === turn && "inset 0 0 0 1000px rgba(0,0,0,.4)",
                                    borderRadius: "5px",
                                }}
                                onClick={() => handleCardClick(card)}
                            >
                                {/* Add for adding adding width and height to parent div */}
                                <img src={process.env.PUBLIC_URL + "/cards/" + card + ".svg"} alt="cards" style={{ visibility: "hidden" }} />
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default LowerSideGameBoard