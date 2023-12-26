import UserProfile from "./UserProfile"


function UpperSideGameBoard({ playerSeat, otherPlayers, turn, trumpSuit, teamRedScore, teamBlackScore }) {
    let trumpSuitSymbol
    switch (trumpSuit) {
        case "S":
            trumpSuitSymbol = <h1 style={{ color: "black" }}>♠</h1>
            break
        case "H":
            trumpSuitSymbol = <h1 style={{ color: "red" }}>♥</h1>
            break
        case "C":
            trumpSuitSymbol = <h1 style={{ color: "black" }}>♣</h1>
            break
        case "D":
            trumpSuitSymbol = <h1 style={{ color: "red" }}>♦</h1>
            break
        default:
            break
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        }}>
            <div style={{
                paddingLeft: "5em"
            }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <h2 style={{ color: "red", display: "inline" }} >{teamRedScore}</h2>
                    <h2 style={{ color: "white", display: "inline" }}> - </h2>
                    <h2 style={{ color: "black", display: "inline" }}>{teamBlackScore}</h2>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <strong style={{ color: "white" }}>TEAMS SCORE</strong>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><UserProfile playerName={otherPlayers[(playerSeat + 2) % 4].player_name} playerSeat={(playerSeat + 2) % 4} turn={turn} /></div>
            <div style={{
                paddingRight: "5em"
            }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>{trumpSuit ? trumpSuitSymbol : <h2 style={{ color: "white" }}>waiting...</h2>}</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <strong style={{ color: "white" }}>TRUMP SUIT</strong>
                </div>
            </div>
        </div >
    )
}

export default UpperSideGameBoard