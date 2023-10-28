import CreateOrJoinGameComponent from "../components/CreateOrJoinGameComponent";
import "../styles/homePage.css";

function HomePage() {
    return (
        <div className="home-container">
            <h1 className="header">Chokri</h1>
            <h2 className="sub-header">No logins. No tracking. Just Fun!</h2>
            <CreateOrJoinGameComponent />
        </div>
    )
}

export default HomePage