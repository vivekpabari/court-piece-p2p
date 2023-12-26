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
    }

    const cardHeaderStyle = {
        textAlign: 'center',
    }

    return (
        <span>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>{playerName}</div>
                <hr class="solid" style={{ margin: "0px" }} />
                <div>
                    <div style={cardHeaderStyle}>{playerSeat === turn ? <span style={cardHeaderStyle}>Turn</span> : ""} </div>
                </div>
            </div>
        </span>
    )
}

export default UserProfile
