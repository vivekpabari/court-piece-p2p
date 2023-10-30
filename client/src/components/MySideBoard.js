import { useState } from "react"

function MySideBoard({myCards}) {

    const [myCurrentCards,setMyCurrentCards] = useState(myCards)

    const cardClick = (Selectedcard) => {
        console.log(Selectedcard)
        setMyCurrentCards((cards) => cards.filter((card) => card !== Selectedcard))
    }

    const GetCards = () => {
        return myCurrentCards.map(card => <img src={process.env.PUBLIC_URL + "/cards/" + card +".svg"} onClick={() => cardClick(card)}/>)
    }
    return <>
        {GetCards()}
    </>
}

export default MySideBoard