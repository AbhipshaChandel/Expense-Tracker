import { Navigate } from "react-router-dom";

function ProtectedRouter({children}){
    const token=localStorage.getItem("token")
    if(!token){
        return <Navigate to="/login" replace/>
    }
    return children
}

export default ProtectedRouter