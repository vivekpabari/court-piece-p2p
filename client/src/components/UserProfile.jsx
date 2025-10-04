import React from 'react'

function UserProfile({ playerName, playerSeat, turn }) {
    const bgColor = playerSeat % 2 === 0 ? '#dc3545' : '#000'

    const cardStyle = {
        width: '10vw',
        backgroundColor: bgColor,
        color: 'white',
        marginBottom: '0.5rem',
        borderRadius: "5px",
        padding: "8px",
        boxShadow: playerSeat === turn && "0px 0px 15px 10px #fff",
    }

    const cardHeaderStyle = {
        textAlign: 'center',
        fontSize: 'larger',
    }

    return (
        <span>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>{playerName}</div>
            </div>
        </span>
    )
}

export default UserProfile
