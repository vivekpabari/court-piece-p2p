import { useState, useEffect } from "react"
import { Container, Row, Col } from 'react-bootstrap'


import { socket, onDataSocketEvent } from "../utils/socket"
import { addDataChannel, createPeerConnection, createOfferAndSend, sendAll } from "../utils/peerconnection"
import { decideWiner } from "../utils/logic"
import CenterSpinner from "./CenteredSpinner"
import MySideBoard from "./MySideBoard"
import SelectTrumpSuitComponent from "./SelectTrumpSuitComponent"
import UserProfile from "./UserProfile"
import "../styles/GameBoardComponent.css"


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
        setOtherPlayersReady(incomingPlayerSeat)
    }
    const handleCloseDataChannel = (incomingPlayerSeat) => {
        console.log("connection close of Data Channel for ", incomingPlayerSeat)
        setOtherPlayersReady(incomingPlayerSeat)
    }

    function handleTurn(drawedCard, drawedCardPlayerSeat) {
        //add card to state
        setCurrentHand(oldHand => {
            const newHand = oldHand.slice()
            newHand[drawedCardPlayerSeat] = drawedCard
            return newHand
        })
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
        //check if all player have draw their cards
        if (currentHand.every((cardValue) => !!cardValue)) {
            //if yes then check winner & decide turn
            const winerPlayerSeat = decideWiner(handWinsList[-1], currentHand, trumpSuit)
            setTurn(winerPlayerSeat)
            setHandWinsList((oldList) => [...oldList, winerPlayerSeat])
            setCurrentHand(['', '', '', ''])
            setHands((oldList) => [...oldList, currentHand])
    
        } else if (currentHand.some((cardValue) => !!cardValue)) {
            //no then decide turn according
            console.log("updating turn")
            setTurn(oldTurn => (oldTurn + 1) % 4)
        }
    }, [currentHand])

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

    if (!cards || !otherPlayers.every(
        otherPlayer => (Object.keys(otherPlayer).length > 0 ? otherPlayer?.dataChannel?.readyState === "open" : true)
    )) {
        return <CenterSpinner text="Loading..." />
    }

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
                <Col xs={8}>
                    <div class="parent">
                        <div className="div1"> test1</div>
                        <div className="div2"> test2</div>
                        <div className="div3"> test3</div>
                        <div className="div4"> test4</div>
                    </div>
                </Col>
                <Col><UserProfile playerName={otherPlayers[(playerSeat + 1) % 4].player_name} playerSeat={(playerSeat + 1) % 4} turn={turn} /></Col>
            </Row>
            <Row>
                <Col xs="2"><UserProfile playerName={playerName} playerSeat={playerSeat} turn={turn} /></Col>
                <Col>{trumpSuit && <MySideBoard playerSeat={playerSeat} turn={turn} myCards={cards} handleMyTurn={handleMyTurn} />}</Col>
            </Row>
        </Container>
        {playerSeat === 0 && !trumpSuit && <SelectTrumpSuitComponent myFirstFivecards={cards.slice(0, 5)} handleSubmitSetTrumpSuit={handleSubmitSetTrumpSuit} />}
    </>;
}

export default GameBoardComponent