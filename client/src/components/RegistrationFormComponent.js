import { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

import { socket } from "../utils/socket"

function RegistrationFormComponent({ playerId, gameId, otherPlayers, handleSubmit }) {
    const playerNameRef = useRef(null)
    const playerSeatRef = useRef(null)
    const [errorPlayerName, setErrorPlayerName] = useState(false)
    const [errorPlayerSeat, setErrorPlayerSeat] = useState(false)
    const [validated, setValidated] = useState(false);

    const validatedFormData = (_playerName, _playerSeat) => {
        return new Promise(resolve => {
            socket.on("valid_player_name_or_player_seat", () => {
                console.log("valid player name and seat")
                resolve(true)
            })
            socket.on("invalid_player_name", () => {
                console.log("Invalid player name")
                setErrorPlayerName(true)
                resolve(false)
            })
            socket.on("invalid_player_seat", () => {
                console.log("Invalid player seat")
                setErrorPlayerSeat(true)
                resolve(false)
            })
        })
    }

    const handleSubmitPlayerDetails = async (event) => {
        console.log("Form submitted")
        event.preventDefault()
        socket.emit("join", { "player_id": playerId, "player_name": playerNameRef.current.value, "player_seat": parseInt(playerSeatRef.current.value), "game_id": gameId })
        const isValid = await validatedFormData(playerNameRef.current.value, playerSeatRef.current.value)
        if (isValid) {
            handleSubmit(playerNameRef.current.value, parseInt(playerSeatRef.current.value))
            setValidated(true)
        } else {
            setValidated(false)
        }
    }

    const getOptions = () => {
        let options
        if (Object.keys(otherPlayers[0]).length === 0) {
            options = <option value="0">No options</option>
        } else if (Object.keys(otherPlayers[1]).length === 0) {
            options = Object.keys(otherPlayers[2]).length === 0
                ? (
                    <>
                        <option value="2">{otherPlayers[0].player_name}</option>
                        <option value="1">Play with other Player</option>
                    </>
                ) : (<option value="1">No options</option>)
        } else if (Object.keys(otherPlayers[2]).length === 0) {

            options = Object.keys(otherPlayers[3]).length === 0 ? (
                <>
                    <option value="2">{otherPlayers[0].player_name}</option>
                    <option value="3">{otherPlayers[1].player_name}</option>
                </>
            ) : (<option value="2">No options</option>)

        } else {
            options = <option value="3">No options</option>
        }
        return options
    }

    return (
        <div>
            <Container>
                <Row className="d-flex justify-content-center align-items-center vh-100">
                    <Col xs={12} sm={8} md={6}>
                        <Form validated={validated}>
                            {errorPlayerName && <Alert type="danger">Player Name already taken</Alert>}
                            {errorPlayerSeat && <Alert type="danger">Player Seat already taken</Alert>}
                            <Form.Group className="mb-3" controlId="formPlayerName">
                                <Form.Label className="text-white text-center lead">What is your name?</Form.Label>
                                <Form.Control ref={playerNameRef} type="text" placeholder="Enter name" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formPlayerTeammate">
                                <Form.Label className="text-white lead">Select your teammate</Form.Label>
                                <Form.Select ref={playerSeatRef}>
                                    {getOptions()}
                                </Form.Select>
                            </Form.Group>
                            <Button variant="primary" type="submit" onClick={handleSubmitPlayerDetails}>
                                Join Game!
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default RegistrationFormComponent