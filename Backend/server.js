const express = require("express");

const app = express();

const PORT = 5000;

let transaction=[
    {
        id:1,
        text:"Salary",
        amount:100000,
        type:"income"

},
{
     id:2,
        text:"Travel",
        amount:10000,
        type:"expense"
}
]

app.get("/", (req, res) => {
    res.send("Backend working successfully");
});

app.get("/api/transaction", (req, res) => {
    res.send(transaction);
});

app.post("/api/transaction",(req,res)=>{
    const newTransaction={
        id:Date.now(),
        text:req.body.text,
        amount:Number(req,body.amount),
        type:req.body.type
    }

    transaction
    .push(newTransaction)

    res.status(201).json(newTransaction)
})

app.delete("/api/transaction/:id",(req,res)=>{
    const id=Number(req.params.id)

    transaction=transaction.filter((t)=>
      t.id!==id
    )
    res.json({message:"transaction deleted"})

})


app.put("/api/transaction/:id",(req,res)=>{
    const id=Number(req.params.id)

    const transaction=transaction.find(
        transaction=>transaction.if===id
    )

    if(!transaction){
        return res.status(404).json({message:"transaction not found"})
    }

    transaction.text=req.body.text
    transaction.amount=Number(req.body.amount)
    transaction.type=req.body.type

    res.json(transaction)
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});