import { useState } from "react";
import "./register.css"

function Register(){
    const [name, setname] = useState("")
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")

    const handleRegister=async(e)=>{
        e.preventDefault()
        try{
          const response=  await fetch("http://localhost:5000/api/auth/register",
            {method:"POST",
                headers:{
                    "Content-type":"application/json"
                },
                body:JSON.stringify({
                    name,   
                    password,
                    email
                })
            }
          )
          const data=await response.json()
          if(!response.ok){
            alert(data.message)
            return
          }
          alert("Registration Successfull")
        }catch(error){
            console.log("Registration error",error)
        }
    }
    return(
        <>
            <div className="Registration page">
                <h1>Create Account</h1>
                <form action="" onSubmit={handleRegister}>
                    <input type="text"
                    placeholder="Name"
                      value={name}
                       onChange={(e)=>setname(e.target.value)}
                     />

                     <input type="email"
                     placeholder="email"
                     value={email}
                     onChange={(e)=>setemail(e.target.value)}
                      />

                      <input type="password"
                      placeholder="password"
                      value={password}
                      onChange={(e)=>setpassword(e.target.value)}
                       />

                       <button type="submit">Register</button>
                </form>
            </div>
        </>
    )
}

export default Register;