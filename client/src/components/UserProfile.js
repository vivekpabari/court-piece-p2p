import { Card } from 'react-bootstrap';

function UserProfile({ playerName, playerSeat, turn }) {
    return (
        <span>
            <Card
                bg={playerSeat % 2 === 0 ? 'danger' : 'dark'}
                text="white"
                style={{ width: '12.5vw' }}
                className="mb-2"
            >
                <Card.Header className='text-center'>{playerName}</Card.Header>
                <Card.Body>
                    <Card.Title>{playerSeat === turn && "Turn"}</Card.Title>
                </Card.Body>
            </Card>
        </span>

    )

}

export default UserProfile
