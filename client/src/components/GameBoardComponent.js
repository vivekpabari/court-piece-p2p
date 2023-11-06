import { useState, useEffect } from "react"
import { Container, Row, Col } from 'react-bootstrap'


import { socket, onDataSocketEvent } from "../utils/socket"
import { addDataChannel, createPeerConnection, createOfferAndSend, sendAll } from "../utils/peerconnection"
import CenterSpinner from "./CenteredSpinner"
import MySideBoard from "./MySideBoard"
import SelectTrumpSuitComponent from "./SelectTrumpSuitComponent"
import UserProfile from "./UserProfile"

function convertFaceToInt(str) {
    try {
        return parseInt(str)
    } catch (err) {
        switch (str) {
            case "T":
                return 10
            case "J":
                return 11
            case "Q":
                return 12
            case "K":
                return 13
            case "A":
                return 14
        }
    }
}

function GameBoardComponent({ playerId, playerName, playerSeat, gameId, _otherPlayers }) {
    const [cards, setCards] = useState()
    const [trumpSuit, setTrumpSuit] = useState()
    const [hands, setHands] = useState([])
    const [currentHand, setCurrentHand] = useState(['', '', '', ''])
    const [turn, setTurn] = useState(0)
    const [handWinsList, setHandWinsList] = useState([])
    const [incomingMessage, setIncomingMessage] = useState()
    const [otherPlayers, setOtherPlayers] = useState([{}, {}, {}, {}])
    const _otherPlayersReady = [false, false, false, false]
    _otherPlayersReady[playerSeat] = true
    const [otherPlayersReady, setOtherPlayersReady] = useState(_otherPlayersReady)

    const handleOtherPlayersReadyState = (connectionstate) => console.log("peerConnection state: ", connectionstate)
    const handleOpenDataChannel = (incomingPlayerSeat) => {
        console.log("connection open of Data Channel for ", incomingPlayerSeat)
        setOtherPlayersReady((oldOtherPlayerReady, index) =>
            index === incomingPlayerSeat ? true : oldOtherPlayerReady
        )
    }
    const handleCloseDataChannel = (incomingplayerSeat) => console.log("connection close of Data Channel for ", incomingplayerSeat);

    function decideWiner() {
        let winerPlayerSeat = handWinsList[-1]
        let currentPlayerSeat = (winerPlayerSeat + 1) % 4
        for (let i = 0; i < 3; i++) {
            if (currentHand[winerPlayerSeat][1] === currentHand[currentHand][1]) {
                if (convertFaceToInt(currentHand[currentHand][0]) > convertFaceToInt(currentHand[winerPlayerSeat][0])) {
                    winerPlayerSeat = currentPlayerSeat
                }
            } else if (currentHand[currentHand][1] === trumpSuit) {
                winerPlayerSeat = currentPlayerSeat
            }
            currentPlayerSeat = (currentPlayerSeat + 1) % 4
        }
        setTurn(winerPlayerSeat)
        setHandWinsList((oldList) => [...oldList, winerPlayerSeat])
        setCurrentHand(['', '', '', ''])
        setHands((oldList) => [...oldList, currentHand])
    }

    function handleTurn(drawedCard, drawedCardPlayerSeat) {
        //add card to state
        setCurrentHand(oldHand => {
            const newHand = oldHand.slice()
            newHand[drawedCardPlayerSeat] = drawedCard
            return newHand
        })
        //check if all player have draw their cards
        if (currentHand.every((cardValue) => !!cardValue)) {
            //if yes then check winner & decide turn
            decideWiner()
        } else {
            //no then decide turn according
            console.log("updating turn")
            setTurn(oldTurn => (oldTurn + 1) % 4)
        }
    }

    const handleMyTurn = (Selectedcard) => {
        if (turn === playerSeat) {
            const payload = {
                "type": "cardDraw",
                "value": Selectedcard
            }
            sendAll(otherPlayers, payload)
            handleTurn(Selectedcard, playerSeat)
        }
    }

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

    const handleIncomingMessage = (message, incomingplayerSeat) => {
        console.log("Message Received through data channel")
        setIncomingMessage({ data: message, sender: incomingplayerSeat })
    };

    useEffect(() => {
        socket.emit("get_cards", { "player_name": playerName, "player_id": playerId, "player_seat": playerSeat, "game_id": gameId })
        getCardsFromServer()
    }, [])

    useEffect(() => {
        console.log("Create or Updating Connection")
        const updatedOtherPlayers = (oldOtherPlayers) => oldOtherPlayers.map((player, index) => {
            if (index !== playerSeat && player?.socket_id !== _otherPlayers[index].socket_id) {
                const peerConnection = createPeerConnection(playerSeat, _otherPlayers[index].socket_id, handleOtherPlayersReadyState)
                const dataChannel = addDataChannel("mainChannel", index, peerConnection, handleIncomingMessage, handleOpenDataChannel, handleCloseDataChannel)
                return { ..._otherPlayers[index], "peerConnection": peerConnection, "dataChannel": dataChannel }
            }
            return { ...player }
        })
        setOtherPlayers((oldOtherPlayers) => updatedOtherPlayers(oldOtherPlayers))
    }, [_otherPlayers])

    useEffect(() => {
        if (incomingMessage) {
            const data = JSON.parse(incomingMessage.data)
            const incomingplayerSeat = incomingMessage.sender
            if (data.type === "trumpSuit" && incomingplayerSeat === 0) {
                setTrumpSuit(data.value)
            } else if (data.type === "cardDraw" && turn === incomingplayerSeat) {
                handleTurn(data.value, incomingplayerSeat)
            }
        }
    }, [incomingMessage])

    useEffect(() => {
        if (otherPlayers.some(otherPlayer => otherPlayer.hasOwnProperty('peerConnection'))) {
            socket.on("data", (data) => onDataSocketEvent(data, playerSeat, otherPlayers))
            for (let i = playerSeat + 1; i < 4; i++) {
                if (otherPlayers[i].peerConnection.connectionState !== "connected") {
                    console.log("sending offer for ", i)
                    createOfferAndSend(playerSeat, otherPlayers[i].socket_id, otherPlayers[i].peerConnection)
                }
            }
            return () => { socket.off("data") }
        }
    }, [otherPlayers])

    if (!cards || otherPlayersReady < 3) {
        return <CenterSpinner text="Loading..." />
    }
    console.log(otherPlayers)
    console.log(otherPlayers[(playerSeat + 2) % 4])
    return <>
        <Container>
            <Row >
                <Col><h3>Team Scores</h3></Col>
                <Col><UserProfile playerName={otherPlayers[(playerSeat + 2) % 4].player_name} playerSeat={(playerSeat + 2) % 4} turn={turn} /></Col>
                <Col>
                    <div><h2>{trumpSuit ? trumpSuit : "waiting..."}</h2></div>
                    <div>
                        <strong>TRUMP SUIT</strong>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col><UserProfile playerName={otherPlayers[(playerSeat + 3) % 4].player_name} playerSeat={(playerSeat + 3) % 4} turn={turn} /></Col>
                <Col xs={8}><h1>Game Board</h1></Col>
                <Col><UserProfile playerName={otherPlayers[(playerSeat + 1) % 4].player_name} playerSeat={(playerSeat + 1) % 4} turn={turn} /></Col>
            </Row>
            <Row>
                <Col><MySideBoard playerSeat={playerSeat} turn={turn} myCards={cards} handleMyTurn={handleMyTurn} /></Col>
            </Row>
        </Container>
        {playerSeat === 0 && !trumpSuit && <SelectTrumpSuitComponent myFirstFivecards={cards.slice(0, 5)} handleSubmitSetTrumpSuit={handleSubmitSetTrumpSuit} />}
    </>;
}

export default GameBoardComponent