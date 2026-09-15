import {Link,useNavigate} from "react-router-dom"
import "./Navbar.css"

function NavBar(){

    const navigate=useNavigate()

    const Logout=()=>{
        localStorage.removeItem("token")
        navigate("/login")
    }

    return(
        <>
        <nav className="Nav">
            <h2>Expense Tracker</h2>
            <div className="nav-links">
                <Link to="/dashboard" >Dashboard</Link>
                <Link to="/statistics" >Statistics</Link>
                <Link to="/profile" >Profile</Link>
                 <button onClick={Logout}>Logout</button>
            </div>
        </nav>


        </>
    )
}

export default NavBar;