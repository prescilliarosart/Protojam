import { useState } from "react"
import "./App.css"
import Parent from "./component/Parent"


export default function App () {
  const [code, setCode]= useState<string>("let vitesse= 3;")

  return(
  <div className="container">
    <Parent code={code} setCode={setCode} />
    </div>
  )
}
     
 

 