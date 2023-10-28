import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from "react-router-dom";


import { generateRandomID } from '../utils/common';


function CreateOrJoinGameComponent() {
    const navigate = useNavigate();
    
    const [openModel, setOpenModel] = useState(false);
    const [gameId, setGameId] = useState("")
    const [copySuccess, setCopySuccess] = useState('');

    const copyClipBoard = () => {
        navigator.clipboard.writeText(document.location.origin + "/game/" + gameId)
        setCopySuccess(true)
    }
    const createGame = () => {
        setGameId(generateRandomID())
        setOpenModel(true);
    }
    const handleClose = () => setOpenModel(false);
    const routeChange = () => navigate("/game/" + gameId);


    return (
        <>
            <div className='button-container'>
                <Button variant='primary' onClick={createGame}>Create New Game</Button>
                <div className='body-text'>OR</div>
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        id="inputPassword5"
                        placeholder="Enter the game id"
                    />
                    <Button variant="outline-info">Join Game</Button>
                </InputGroup>
            </div>
            <div>
                <Modal show={openModel} onHide={handleClose} centered>
                    <Modal.Body>
                        <div className="text-center">
                            <Button variant="primary" onClick={routeChange}>
                                Join Game
                            </Button>
                        </div>
                        <hr />
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                id="gameUrl"
                                value={document.location.origin + "/game/" + gameId}
                                readOnly
                            />
                            <Button variant="outline-secondary" onClick={copyClipBoard}>{copySuccess ? "Copied!" : "copy"}</Button>
                        </InputGroup>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    )
}

export default CreateOrJoinGameComponent