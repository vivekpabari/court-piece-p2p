import { useState, useEffect } from "react"
import { Button } from "react-bootstrap"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { socket } from "../utils/socket"
import { sendAll } from "../utils/peerconnection"
import CenterSpinner from "./CenteredSpinner"
import MySideBoard from "./MySideBoard";
import SelectTrumpSuitComponent from "./SelectTrumpSuitComponent";

function GameBoardComponent({ playerId, playerName, playerSeat, gameId, otherPlayers }) {
    const [cards, setCards] = useState();
    const [trumpSuit, setTrumpSuit] = useState()

    const handleSubmitSetTrumpSuit = (suit) => {
        setTrumpSuit(suit)
        const payload = {
            "type": "trumpSuit",
            "value": suit
        }
        sendAll(otherPlayers, payload)
    }

    const getCardsFromServer = async () => {
        const newCard = await new Promise(resolve => {
            socket.on("get_cards", (data) => {
                resolve(data)
            })
        })
        setCards(newCard)
        console.log("received cards")
    }

    useEffect(() => {
        socket.emit("get_cards", { "player_name": playerName, "player_id": playerId, "player_seat": playerSeat, "game_id": gameId })
        getCardsFromServer()
    }, [])

    if (!cards) {
        return <CenterSpinner text="Fetching Cards" />
    }

    return <>
        <Container>
            <Row>
                <Col><h3>Team Scores</h3></Col>
                <Col><h3>My Teammate</h3></Col>
                <Col>
                    <div><h2>{trumpSuit ? trumpSuit : "waiting..."}</h2></div>
                    <div>
                        <strong>TRUMP SUIT</strong>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col><h3>Other Team player 1</h3></Col>
                <Col xs={8}><h1>Game Board</h1></Col>
                <Col><h3>Other Team player 2</h3></Col>
            </Row>
            <Row>
                <Col><MySideBoard myCards={cards} /></Col>
            </Row>
        </Container>
        {playerSeat === "0" && <SelectTrumpSuitComponent myFirstFivecards={cards.slice(0, 5)} handleSubmitSetTrumpSuit={handleSubmitSetTrumpSuit} />}
    </>;
}

export default GameBoardComponent