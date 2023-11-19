import { Col } from "react-bootstrap"

import UserProfile from "./UserProfile"
import MySideBoard from "./MySideBoard"

function LowerSideGameBoard({playerName, playerSeat, turn, handleMyTurn, cards, trumpSuit}) {
    return (
        <>
            <Col xs="2"><UserProfile playerName={playerName} playerSeat={playerSeat} turn={turn} /></Col>
            <Col>{trumpSuit && <MySideBoard playerSeat={playerSeat} turn={turn} myCards={cards} handleMyTurn={handleMyTurn} />}</Col>
        </>
    )
}

export default LowerSideGameBoard