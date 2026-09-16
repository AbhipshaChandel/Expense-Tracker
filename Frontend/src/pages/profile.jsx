import {useState,useEffect} from "react";
import NavBar from "../components/Navbar"

function Profile(){
    const [user, setuser] = useState(null)

    useEffect(()=>{
        const getprofile=async()=>{
        try{
            const token=localStorage.getItem("token")
            const response=await fetch("http://localhost:5000/api/auth/profile",{
                headers:{
                    Authorization:`Bearer ${token}`
                }

            })
            const data =await response.json()
            if(!response.ok){
                alert(data.message)
                return
            }
            setuser(data.user)
        }catch(error){
            return res.status(500).json({message:"fetching error profile",error})
        }

    }
    getprofile()
    },[])

    if(!user){
        return <h2>Loading....</h2>
    }
    return(
        <>
        <NavBar/>
         <div className="profile">
            <h1>My Profile</h1>
            <div className="profile-card">
                <h2>{user.name}</h2>
                <p>Email:{user.email}</p>
            </div>
         </div>
        </>
    )
}

export default Profile;