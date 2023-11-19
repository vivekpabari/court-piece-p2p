import React from 'react';
import { Spinner } from 'react-bootstrap';
import "../styles/CenteredSpinner.css"

const CenteredSpinner = (props) => {
  return (
    <div className="centered-spinner">
      <Spinner animation="border" variant="light" />
      <h4 style={{color: "white"}}>{props.text}</h4>
    </div>
  );
};

export default CenteredSpinner;
