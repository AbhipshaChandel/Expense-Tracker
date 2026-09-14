import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import ExpenseTracker from "./expenseTracker";
import ProtectedRouter from "./protectedRoutes"
function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/register"/>}/>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/expense" element={<ProtectedRouter><ExpenseTracker /></ProtectedRouter>} />

        </Routes>
      </BrowserRouter>
      
    </>
  );
}

export default App;
