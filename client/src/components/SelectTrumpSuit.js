import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';


function SelectTrumpSuit({ myFirstFivecards, handleSubmitSetTrumpSuit }) {
  const [show, setShow] = useState(true)

  const handleClose = () => setShow(false)

  const handleSelect = (suit) => {
    handleSubmitSetTrumpSuit(suit)
    setShow(false)
  }

  const getMyFirstFiveCards = () => {
    return myFirstFivecards.map(card =>
      <span className="cardList">
        <img src={process.env.PUBLIC_URL + "/cards/" + card + ".svg"} alt="cards" />
      </span>
    )
  }

  const buttonGroupStyle = {
    display: "flex",
    justifyContent: "space-between",
    margin: "20px",
  }

  return <>
    <Modal
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Body>
        <div><h4>Select Trump Suit</h4></div>
        <div style={buttonGroupStyle}>
          <Button className="rounded-circle" variant="dark" size="lg" onClick={() => handleSelect("S")}>♠</Button>
          <Button className="rounded-circle" variant="danger" size="lg" onClick={() => handleSelect("H")}>♥</Button>
          <Button className="rounded-circle" variant="dark" size="lg" onClick={() => handleSelect("C")}>♣</Button>
          <Button className="rounded-circle" variant="danger" size="lg" onClick={() => handleSelect("D")}>♦</Button>
        </div>
        <div><h4>Your Cards:</h4></div>
        <div className="cardLists">
          {getMyFirstFiveCards()}
        </div>
      </Modal.Body>
    </Modal>
  </>
}

export default SelectTrumpSuit