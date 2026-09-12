const jwt=require("jsonwebtoken")

const protect=(req,res,next)=>{
    try{
    const authHeader=req.headers.authorization
    if(!authHeader || !authHeader.startsWIth("Bearer ")){
        return res.status(401).json({message:"Not authorized"})
    }

    const token=authHeader.split(" ")[1]

    const decode=jwt.verify(
        token,
        process.env.JWT_SECRET
    )
    req.userID=decode.userID
    next()
}catch(error){
    res.status(401).json({message:"Invalid or expired token"})
}
}

module.exports=protect