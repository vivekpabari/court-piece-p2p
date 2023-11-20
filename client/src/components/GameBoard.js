import { useState, useEffect } from "react"
import { Container, Row } from 'react-bootstrap'


import { socket, onDataSocketEvent } from "../utils/socket"
import { addDataChannel, createPeerConnection, createOfferAndSend, sendAll } from "../utils/peerconnection"
import { decideWiner } from "../utils/logic"
import CenterSpinner from "./CenteredSpinner"
import SelectTrumpSuit from "./SelectTrumpSuit"
import MiddleSideGameBoard from "./MiddleSideGameBoard"
import UpperSideGameBoard from "./UpperSideGameBoard"
import LowerSideGameBoard from "./LowerSideGameBoard"
import WinDisplayModal from "./WinDisplayModal"


function GameBoard({ playerId, playerName, playerSeat, gameId, _otherPlayers }) {
    const [cards, setCards] = useState()
    const [trumpSuit, setTrumpSuit] = useState()
    const [hands, setHands] = useState([])
    const [currentHand, setCurrentHand] = useState(['', '', '', ''])
    const [turn, setTurn] = useState(0)
    const [handWinsList, setHandWinsList] = useState([])
    const [incomingMessage, setIncomingMessage] = useState()
    const [otherPlayers, setOtherPlayers] = useState([{}, {}, {}, {}])
    const [otherPlayersReady, setOtherPlayersReady] = useState()

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
    }

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
            setTimeout(() => {
                const winerPlayerSeat = decideWiner(handWinsList[-1], currentHand, trumpSuit)
                setTurn(winerPlayerSeat)
                setHandWinsList((oldList) => [...oldList, winerPlayerSeat])
                setCurrentHand(['', '', '', ''])
                setHands((oldList) => [...oldList, currentHand])
            }, 3000)
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
        (otherPlayer, index) => (Object.keys(otherPlayer).length > 0 && index !== playerSeat ? otherPlayer?.dataChannel?.readyState === "open" : true)
    )) {
        return <CenterSpinner text="Loading..." />
    }

    let teamRedScore = 0, teamBlackScore = 0
    handWinsList.forEach(element => {
        if (element % 2 === 0) {
            teamRedScore += 1
        } else {
            teamBlackScore += 1
        }
    })

    return <>
        {(teamRedScore >= 7 || teamBlackScore >= 7) && <WinDisplayModal teamBlackScore={teamBlackScore} teamRedScore={teamRedScore} otherPlayers={otherPlayers} playerSeat={playerSeat} />}
        <Container>
            <Row >
                <UpperSideGameBoard playerSeat={playerSeat} otherPlayers={otherPlayers} turn={turn} trumpSuit={trumpSuit} teamRedScore={teamRedScore} teamBlackScore={teamBlackScore} />
            </Row>
            <Row>
                <MiddleSideGameBoard playerSeat={playerSeat} otherPlayers={otherPlayers} turn={turn} currentHand={currentHand} />
            </Row>
            <Row>
                <LowerSideGameBoard playerName={playerName} playerSeat={playerSeat} turn={turn} handleMyTurn={handleMyTurn} trumpSuit={trumpSuit} cards={cards} />
            </Row>
        </Container>
        {playerSeat === 0 && !trumpSuit && <SelectTrumpSuit myFirstFivecards={cards.slice(0, 5)} handleSubmitSetTrumpSuit={handleSubmitSetTrumpSuit} />}
    </>
}

export default GameBoard