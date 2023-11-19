import { Col } from "react-bootstrap"

import UserProfile from "./UserProfile"
import "../styles/MiddleSideGameBoard.css"

function MiddleSideGameBoard({ playerSeat, otherPlayers, turn, currentHand }) {
    return (
        <>
            <Col><UserProfile playerName={otherPlayers[(playerSeat + 3) % 4].player_name} playerSeat={(playerSeat + 3) % 4} turn={turn} /></Col>
            <Col xs={8}>
                <div class="parent">
                    <div className="div1">
                        <div id="front" className={"cardFront" + (currentHand[(playerSeat + 2) % 4] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + ((playerSeat + 2) % 2 === 0 ? '2B' : '1B') + ".svg"} />
                        </div>
                        <div id="back" className={"cardBack" + (currentHand[(playerSeat + 2) % 4] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + currentHand[(playerSeat + 2) % 4] + ".svg"} />
                        </div>
                    </div>
                    <div className="div2">
                        <div id="front" className={"cardFront" + (currentHand[(playerSeat + 1) % 4] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + ((playerSeat + 1) % 2 === 0 ? '2B' : '1B') + ".svg"} />
                        </div>
                        <div id="back" className={"cardBack" + (currentHand[(playerSeat + 1) % 4] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + currentHand[(playerSeat + 1) % 4] + ".svg"} />
                        </div>
                    </div>
                    <div className="div3">
                        <div id="front" className={"cardFront" + (currentHand[playerSeat] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + ((playerSeat) % 2 === 0 ? '2B' : '1B') + ".svg"} />
                        </div>
                        <div id="back" className={"cardBack" + (currentHand[playerSeat] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + currentHand[playerSeat] + ".svg"} />
                        </div>
                    </div>
                    <div className="div4">
                        <div id="front" className={"cardFront" + (currentHand[(playerSeat + 3) % 4] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + ((playerSeat + 3) % 2 === 0 ? '2B' : '1B') + ".svg"} />
                        </div>
                        <div id="back" className={"cardBack" + (currentHand[(playerSeat + 3) % 4] ? ' flipped' : '')}>
                            <img className="cards" src={process.env.PUBLIC_URL + "/cards/" + currentHand[(playerSeat + 3) % 4] + ".svg"} />
                        </div>
                    </div>
                </div>
            </Col>
            <Col><UserProfile playerName={otherPlayers[(playerSeat + 1) % 4].player_name} playerSeat={(playerSeat + 1) % 4} turn={turn} /></Col>
        </>

    )
}

export default MiddleSideGameBoard