import { useState } from "react"
import "./App.css"
import Parent from "./component/Parent"
import Enfant from "./component/Enfant"

const CODE_DEPART = `let vitesse = 3;
let niveau = 10;
let taille = 50;
let obstacles = 1;
if (score > 5) { vitesse = 3; }`

export default function App() {
  const [code, setCode] = useState<string>(CODE_DEPART)

  return (
    <div className="container">
      <Parent code={code} setCode={setCode} />
      <Enfant code={code} />
    </div>
  )
}
