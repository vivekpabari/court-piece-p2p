import React, { useState } from 'react';

import { Modal, Button } from 'react-bootstrap';

import "../styles/SelectTrumpSuit.css"

function SelectTrumpSuitComponent({ myFirstFivecards, handleSubmitSetTrumpSuit }) {
  const [show, setShow] = useState(true)
  
  const handleClose = () => setShow(false); 

  const handleSelect = (suit) => {
    handleSubmitSetTrumpSuit(suit)
    setShow(false)
  }

  const getMyFirstFiveCards = () => {
    return myFirstFivecards.map(card =>
      <span className="avatar">
        <img src={process.env.PUBLIC_URL + "/cards/" + card + ".svg"} />
      </span>
    )
  }

  return <>
    <Modal
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Body>
        <div><h4>Select Trump Suit</h4></div>
        <div className="button-group">
          <Button className="rounded-circle" variant="dark" size="lg" onClick={() => handleSelect("S")}>♠</Button>
          <Button className="rounded-circle" variant="danger" size="lg" onClick={() => handleSelect("H")}>♥</Button>
          <Button className="rounded-circle" variant="dark" size="lg" onClick={() => handleSelect("C")}>♣</Button>
          <Button className="rounded-circle" variant="danger" size="lg" onClick={() => handleSelect("D")}>♦</Button>
        </div>
        <div><h4>Your Cards:</h4></div>
        <div className="avatars">
          {getMyFirstFiveCards()}
        </div>
      </Modal.Body>
    </Modal>
  </>
}

export default SelectTrumpSuitComponent