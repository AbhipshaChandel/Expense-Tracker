import { useState } from 'react'
// import './App.css'

function App() {
   const [transactions, settransactions] = useState([
    {
      id:1,
      text:"salary",
      amount:10000,
      type:"income"
    },
    {
      id:2,
      text:"travel",
      amount:5000,
      type:"expense"
    }
   ])

   const [text, settext] = useState("")
   const [amount, setamount] = useState("")
   const [type, settype] = useState("expense")
   const [showform, setshowform] = useState(false)
   const [search, setsearch] = useState("")

   const income=transactions
   .filter((t)=>{t.type==="income"})
   .reduce((acc,t)=>{acc+t.amount,0})

   const expense=transactions
   .filter((t)=>{t.type=="expense"})
   .reduce((acc,t)=>{acc+t.amount,0})

   const balance=income-expense

   const addtransaction=(e)=>{
    e.preventDefault()

    if(!text || !amount){
      alert("Please add a transaction")
      return;
    }

    const newTransaction={
      id:Date.now(),
      text:text,
      amount:Number(amount),
       type:type


    }

    settransactions([...transactions,newTransaction])
    settext("")
    setamount("")
    settype("expense")
    setshowform(false)
   }

   const filteredtransactions=transactions.filter((t)=>{
    t.text.toLowerCase().includes(search.toLowerCase())
   })

  return (
    <>
      <section className='Header'>
        <h1>Expense Tracker</h1>
      </section>

      <section className='Add-transaction'>
        <div className="balance">Balance:</div>
        <button className="add"></button>
      </section>


     <section className="show-expense-income">
      <div className="expense">Expense</div>
      <div className="income">Income</div>
     </section>




      <section className='Transactions'></section>
    </>
  )
}

export default App
