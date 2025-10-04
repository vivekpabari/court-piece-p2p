import { Modal, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"

function WinDisplayModal({ teamBlackScore, teamRedScore, otherPlayers, playerSeat }) {
    const navigate = useNavigate()

    let winners;
    if (teamBlackScore >= 7) {
        if (playerSeat % 2 === 0) {
            winners = otherPlayers[1].player_name + " & " + otherPlayers[3].player_name
        } else {
            winners = "you & " + (otherPlayers[1]?.player_name || otherPlayers[3]?.player_name)
        }
    } else {
        if (playerSeat % 2 === 0) {
            winners = "you & " + (otherPlayers[0]?.player_name || otherPlayers[2]?.player_name)
        } else {
            winners = otherPlayers[0].player_name + " & " + otherPlayers[2].player_name
        }
    }

    return (
        <Modal show="true">
            <Modal.Header>
                <Modal.Title>Game Over</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <h3>The Winners</h3>
                    <h3>{winners}</h3>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => navigate("/")}>
                    Play New Game
                </Button>
            </Modal.Footer>
        </Modal>

    )
}

export default WinDisplayModal