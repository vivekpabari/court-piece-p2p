import { Col } from "react-bootstrap"

import UserProfile from "./UserProfile"


function UpperSideGameBoard({ playerSeat, otherPlayers, turn, trumpSuit, teamRedScore, teamBlackScore }) {
    return (
        <>
            <Col>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <h3 style={{ color: "red", display: "inline" }} >{teamRedScore}</h3>
                    <h3 style={{ color: "white", display: "inline" }}> - </h3>
                    <h3 style={{ color: "black", display: "inline" }}>{teamBlackScore}</h3>
                </div>
            </Col >
            <Col><UserProfile playerName={otherPlayers[(playerSeat + 2) % 4].player_name} playerSeat={(playerSeat + 2) % 4} turn={turn} /></Col>
            <Col>
                <div><h2>{trumpSuit ? trumpSuit : "waiting..."}</h2></div>
                <div>
                    <strong>TRUMP SUIT</strong>
                </div>
            </Col>
        </>
    )
}

export default UpperSideGameBoard