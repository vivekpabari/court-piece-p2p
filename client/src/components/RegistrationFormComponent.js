import { useRef } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';

function RegistrationFormComponent(props) {

    const { otherPlayers } = props

    const playerNameRef = useRef(null)
    const playerSeatRef = useRef(null)


    const handleSubmitPlayerDetails = (event) => {
        console.log("Form submitted")
        event.preventDefault()
        props.handleSubmit(playerNameRef.current.value, playerSeatRef.current.value)
    }


    const SelectSeat = () => {
        let options
        if (Object.keys(otherPlayers[0]).length === 0) {
            options = <option value="0">No options1</option>
        } else if (Object.keys(otherPlayers[1]).length === 0) {
            options = Object.keys(otherPlayers[2]).length === 0
                ? (
                    <>
                        <option value="2">{otherPlayers[0].player_name}</option>
                        <option value="1">Play with other Player</option>
                    </>
                ) : (<option value="1">No options2</option>)
        } else if (Object.keys(otherPlayers[2]).length === 0) {

            options = Object.keys(otherPlayers[3]).length === 0 ? (
                <>
                    <option value="2">{otherPlayers[0].player_name}</option>
                    <option value="3">{otherPlayers[1].player_name}</option>
                </>
            ) : (<option value="2">No options2</option>)

        } else {
            options = <option value="3">No options3</option>
        }
        return (
            <InputGroup className="mb-3">
                <Form.Label>Select Teammate</Form.Label>
                <Form.Select ref={playerSeatRef} aria-label="Select Teammate">
                    {options}
                </Form.Select>
            </InputGroup>
        )
    }

    return (
        <div>
            <Container>
                <Row className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <Col xs={12} sm={8} md={6}>
                        <Form onSubmit={handleSubmitPlayerDetails}>
                            <InputGroup className="mb-3">
                                <Form.Label htmlFor="playerName">What is your name ?</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="playerName"
                                    placeholder="Enter name"
                                    ref={playerNameRef}
                                />
                            </InputGroup>
                            <SelectSeat />
                            <Button type="submit" variant="primary">Start</Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default RegistrationFormComponent