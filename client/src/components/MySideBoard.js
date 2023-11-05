import { useState } from "react"
import "../styles/MysideBoard.css"

function MySideBoard({ playerSeat, turn, myCards, handleMyTurn }) {
    const [myCurrentCards, setMyCurrentCards] = useState(myCards)

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

    return <>
        {GetCards()}
    </>
}

export default MySideBoard