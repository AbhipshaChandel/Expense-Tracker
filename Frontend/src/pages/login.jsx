import { useState } from "react";
import "./login.css"

function Login(){
const [email, setemail] = useState("")
 const [password, setpassword] = useState("")
 const handleLogin=async(e)=>{
    e.preventDefault()
    try{
        const response=await fetch("http://localhost:5000/api/auth/login",
            {
                method:"POST",
                headers:{"Content-type":"application/json"},
                body:JSON.stringify({
                    email,password
                })
            }
        )

        const data=await response.json()
        if(!response.ok){
            alert(data.message)
            return
        }
        localStorage.setItem("token",data.Token)
        alert("Login Successfully")
    }catch(error){
        console.log("Login Failed",error)
    }
 }
    return(
        <>
            <div className="login">
                <h1>LOGIN</h1>
                <form action="" onSubmit={handleLogin}>

                    <input type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e)=>setemail(e.target.value)} />

                      <input type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e)=>setpassword(e.target.value)} />

                    <button type="submit">Login</button>
                </form>
            </div>
        </>
    )
}


export default Login;