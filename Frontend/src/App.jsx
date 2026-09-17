import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./dashboard";
import Statistics from "./pages/statistics";
import Profile from "./pages/profile";
import ProtectedRouter from "./protectedRoutes";
import NavBar from "./components/Navbar"
function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/register"/>}/>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRouter><><NavBar/></><Dashboard /></ProtectedRouter>} />
          <Route path="/statistics" element={<ProtectedRouter><><NavBar/></><Statistics/></ProtectedRouter>}/>
          <Route path="/profile" element={<ProtectedRouter><><NavBar/></><Profile/></ProtectedRouter>}/>

        </Routes>
      </BrowserRouter>
      
    </>
  );
}

export default App;
