const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors=require("cors")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const User=require("./models/user")

require("dotenv").config();
const Transaction=require("./models/transaction")

const app = express();

app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });

//--------------------//USER REGISTER//---------------------------//

  app.post("/api/auth/register",async(req,res)=>{
    try{
      const {name,email,password}=req.body
      if(!name || !email || !password){
       return res.status(404).json({message:"Provide all information"})
      }

      const UserExist=await User.findOne({email})    
      if(UserExist){
       return res.status(400).json({message:"User already exist"})
      }

      const hashedPassword=await bcrypt.hash(password,10)

      const user=await User.create({
        name,
        email,
        password:hashedPassword
      })

      res.status(201).json({
        messaage:"User registered successfully",
        user:{
          id:user._id,
          name:user.name,
          email:user.email
        }
      })
    }catch(err){
      res.status(404).json({message:"Registration failed"})
    }

  })


  //--------------------//USER LOGIN//---------------------------//

  app.post("/api/auth/login",async(req,res)=>{
    try{
      const {password,email}=req.body
      const user=await User.findOne({email})

      if(!user){
        return res.status(401).json({message:"Invalid email or password"})
      }

      const checkpassword=await bcrypt.compare(
        password,user.password
      )

      if(!checkpassword){
        return res.status(401).json({message:"Invalid email or password"})

      }

      const Token=jwt.sign(
        {
          userID:user._id
        },
        process.env.JWT_SECRET,
        {
         ExpiresIn:"1D"
        }
      )

      res.status(400).json({
        message:"Login Successfully",token,
        user:{
          id:user._id,
          name:user.name,
          email:user.email
        }
      })

    }catch(err){
      res.status(500).json({message:"Login Failed"})
    }
  })


app.get("/api/transaction",async(req,res)=>{
  try{
    const transactions=await Transaction.find()
    res.json(transactions)
  }catch(error){
   res.status(404).json({
    message:"Failed to fetch transaction"
   })
  }
})

app.post("/api/transaction",async(req,res)=>{
  try{
    const newTransaction=new Transaction({
      text:req.body.text,
      amount:Number(req.body.amount),
      type:req.body.type
    })

    const saveTransaction=await newTransaction.save()
    res.status(201).json(saveTransaction)
  }catch(error){
    res.status(404).json({
      message:"Failed to add Transaction",error:error.message
    })
  }
})

app.delete("/api/transaction/:id",async(req,res)=>{
  try{
    const transaction=await Transaction.findByIdAndDelete(req.params.id)

    if(!transaction){
      return res.status(404).json({message:"transaction not found"})
    }

    res.json({message:"transaction deleted"})
  }catch(error){
    res.status(404).json({
      message:"Failed to delete transaction"
    })
  }
})

app.put("/api/transaction/:id",async(req,res)=>{
  try{
    const updatetransaction=await Transaction.findByIdAndUpdate(req.params.id,

      {
        text:req.body.text,
        amount:Number(req.body.amount),
        type:req.body.type
      },
      {
        new:true,
        runValidators:true
      }
    )

    if(!updatetransaction){
      return res.status(500).json({message:"Transaction not found"})
    }

    res.json(updatetransaction)
  }catch(error){
    res.status(500).json({message:"Failed to update transaction",error:error.message})
  }
})
// let transaction=[
//     {
//         id:1,
//         text:"Salary",
//         amount:100000,
//         type:"income"

// },
// {
//      id:2,
//         text:"Travel",
//         amount:10000,
//         type:"expense"
// }
// ]

// app.get("/", (req, res) => {
//     res.send("Backend working successfully");
// });

// app.get("/api/transaction", (req, res) => {
//     res.send(transaction);
// });

// app.post("/api/transaction",(req,res)=>{
//     const newTransaction={
//         id:Date.now(),
//         text:req.body.text,
//         amount:Number(req.body.amount),
//         type:req.body.type
//     }

//     transaction
//     .push(newTransaction)

//     res.status(201).json(newTransaction)
// })

// app.delete("/api/transaction/:id",(req,res)=>{
//     const id=Number(req.params.id)

//     transaction=transaction.filter((t)=>
//       t.id!==id
//     )
//     res.json({message:"transaction deleted"})

// })


// app.put("/api/transaction/:id",(req,res)=>{
//     const id=Number(req.params.id)

//     const transactions=transaction.find(
//         transaction=>transaction.id===id
//     )

//     if(!transactions){
//         return res.status(404).json({message:"transaction not found"})
//     }

//     transactions.text=req.body.text
//     transactions.amount=Number(req.body.amount)
//     transactions.type=req.body.type

//     res.json(transactions)
// })

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });