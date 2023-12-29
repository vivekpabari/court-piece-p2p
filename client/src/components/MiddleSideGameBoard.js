import UserProfile from "./UserProfile"


function SingleCard({ backSideCard, drawCard }) {
    return <div class={"content " + (drawCard ? "flipped" : '')}>
        <div class="front">
            <img className="singleCard" src={process.env.PUBLIC_URL + "/cards/" + backSideCard + ".svg"} alt="cards" />
        </div>
        <div class="back">
            <img className="singleCard" src={process.env.PUBLIC_URL + "/cards/" + drawCard + ".svg"} alt="cards" />
        </div>
    </div>
}

function MiddleSideGameBoard({ playerSeat, otherPlayers, turn, currentHand }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
            <div><UserProfile playerName={otherPlayers[(playerSeat + 3) % 4].player_name} playerSeat={(playerSeat + 3) % 4} turn={turn} /></div>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <SingleCard backSideCard={(playerSeat + 3) % 2 === 0 ? '2B' : '1B'} drawCard={currentHand[(playerSeat + 3) % 4]} />
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                }}>
                    <SingleCard backSideCard={(playerSeat + 2) % 2 === 0 ? '2B' : '1B'} drawCard={currentHand[(playerSeat + 2) % 4]} />
                    <SingleCard backSideCard={playerSeat % 2 === 0 ? '2B' : '1B'} drawCard={currentHand[playerSeat % 4]} />
                </div>
                <SingleCard backSideCard={(playerSeat + 1) % 2 === 0 ? '2B' : '1B'} drawCard={currentHand[(playerSeat + 1) % 4]} />
            </div>
            <div><UserProfile playerName={otherPlayers[(playerSeat + 1) % 4].player_name} playerSeat={(playerSeat + 1) % 4} turn={turn} /></div>
        </div>
    )
}

export default MiddleSideGameBoard