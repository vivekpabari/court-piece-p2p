import CreateOrJoinGame from "../components/CreateOrJoinGame"
import "../styles/homePage.css"

function HomePage() {
    return (
        <div className="home-container">
            <h1 className="header">Court Piece</h1>
            <h2 className="sub-header">No logins. No tracking. Just Fun!</h2>
            <CreateOrJoinGame />
        </div>
    )
}

export default HomePage