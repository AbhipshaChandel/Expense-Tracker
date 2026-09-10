const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors=require("cors")
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


app.get("/api/transaction",async(req,res)=>{
  try{
    const transactions=await Transaction.find()
    res.json(transactions)
  }catch(error){
   res.status(500).json({
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
    res.status(500).json({
      message:"Failed to add Transaction",error:error.message
    })
  }
})

app.delete("/api/transaction/:id",async(req,res)=>{
  try{
    const transaction=await Transaction.findByIdAndDelete(req.params.id)

    if(!transaction){
      return res.status(500).json({message:"transaction not found"})
    }

    res.json({message:"transaction deleted"})
  }catch(error){
    res.status(500).json({
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

    res.json({message:"Transaction Updated successfully"})
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