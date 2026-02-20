import { useState, useEffect, useRef } from "react"
import "../style/Enfant.css"
import playerImg from "../assets/images/player.png"
import playerJump from "../assets/images/playerjump.png"
import playerDead from "../assets/images/playerdead.png"
import playerLost from "../assets/images/Emojilost.png"
import CactusImg from "../assets/images/cactus.png"

interface EnfantProps {
  code: string
}

interface Vars {
  vitesse: number
  taille: number
  obstacles: number
  niveau: number
}

function parseVars(code: string): Vars {
  const vars: Vars = { vitesse: 3, taille: 50, obstacles: 1, niveau: 10 }
  for (const m of code.matchAll(/let\s+(\w+)\s*=\s*(.+?);/g)) {
    const key = m[1] as keyof Vars
    const val = Number(m[2].trim())
    if (key in vars) vars[key] = val
  }
  return vars
}

const GROUND = 220
const OBS_W = 28
const OBS_H = 40

export default function Enfant({ code }: EnfantProps) {
  const vars = parseVars(code)
  const varsRef = useRef(vars)
  const [posY, setPosY] = useState(GROUND)
  const [jumping, setJumping] = useState(false)
  const [obstacles, setObstacles] = useState(
    Array.from({ length: vars.obstacles }, (_, i) => ({ x: 500 + i * 500 }))
  )
  const [score, setScore] = useState(0)
  const [win, setWin] = useState(false)
  const [dead, setDead] = useState(false)
  const [started, setStarted] = useState(false)

  const jumpRef = useRef(false)
  const deadRef = useRef(false)
  const posYRef = useRef(GROUND)

  useEffect(() => {
    varsRef.current = vars
  }, [vars])

  useEffect(() => {
    posYRef.current = posY
  }, [posY])

  const doJump = () => {
    if (jumpRef.current || deadRef.current) return
    jumpRef.current = true
    setJumping(true)
    let py = GROUND
    let vy = -35 
    const gravity = 1.5
    const t = setInterval(() => {
      py += vy
      vy += gravity

    
      
      if (py >= GROUND) {
        py = GROUND
        jumpRef.current = false
        setJumping(false)
        clearInterval(t)
      }
      setPosY(py)
    }, 20)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); doJump() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Boucle de jeu
  useEffect(() => {
    if (!started || dead || win) return
    deadRef.current = false

    const loop = setInterval(() => {
      const v = varsRef.current
      const speed = Math.min(Math.max(v.vitesse, 1), 12)
      const taille = Math.min(Math.max(v.taille, 20), 80)
      const numObs = Math.min(Math.max(v.obstacles, 1), 4)
      const espace = 300

      setObstacles(prev => {
        let next = prev.map(o => ({ x: o.x - speed }))

        // Collision
        for (const o of next) {
          const hit =
            o.x < 60 + taille - 10 &&
            o.x + OBS_W > 60 + 10 &&
            posYRef.current + taille / 2 > GROUND - OBS_H + 5
          if (hit) {
            deadRef.current = true
            setDead(true)
            return prev
          }
        }

        // Reset obstacles
        next = next.map((o, i) => {
          if (o.x < -OBS_W) {
            setScore(prev => {
              const newScore = prev + 1
              if (newScore >= v.niveau) setWin(true)
              return newScore
            })
            const maxX = Math.max(...next.map(n => n.x))
            return { x: maxX + espace + (i % numObs) * 80 }
          }
          return o
        })

        while (next.length < numObs) next.push({ x: Math.max(...next.map(n => n.x)) + 300 })
        while (next.length > numObs) next.pop()
        return next
      })
    }, 30)

    return () => clearInterval(loop)
  }, [started, dead, win])

  const restart = () => {
    setStarted(false)
    setWin(false)
    setDead(false)
    deadRef.current = false
    setScore(0)
    setPosY(GROUND)
    posYRef.current = GROUND
    jumpRef.current = false
    setJumping(false)
    setObstacles(Array.from({ length: varsRef.current.obstacles }, (_, i) => ({ x: 500 + i * 300 })))
  }

  return (
    <div className="ecran-enfant" onClick={doJump}>
      <div className="enfant-header">
        <span>🎮 Ecran Enfant</span>
        <span>⭐ Score : {score}</span>
      </div>

      <div className="sol" />
      <div className="herbe" />

      {obstacles.map((o, i) => (
        <div key={i} className="obstacle" style={{ left: o.x }}>
          <img src={CactusImg} alt="obstacle" style={{ width: "70px", height: "80px" }} />
        </div>
      ))}

      <div className="joueur" style={{
        bottom: 50 + (GROUND - posY),
        width: vars.taille,
        height: vars.taille,
        fontSize: vars.taille * 0.5,
      }}>
        {dead ? <img src={playerDead} alt="playerdead" style={{ width: vars.taille, height: vars.taille }} /> :
         jumping ? <img src={playerJump} alt="playerjump" style={{ width: vars.taille, height: vars.taille }} /> :
         <img src={playerImg} alt="player" style={{ width: vars.taille, height: vars.taille }} />}
      </div>

      {win && <div className="overlay">
        <div>🏆</div>
        <p>Bravo ! Tu as gagné avec {score} points !</p>
        <button onClick={restart}>Rejouer 🔄</button>
      </div>}

      {dead && <div className="overlay">
        <div><img src={playerLost} alt="playerlost" style={{ width: 70, height: 80 }} /></div>
        <p>Perdu ! Score : {score}</p>
        <button onClick={restart}>Rejouer 🔄</button>
      </div>}

      {!started && <div className="overlay">
        <div>🎮</div>
        <p>Appuie sur <strong>ESPACE</strong> ou clique ici !</p>
        <button onClick={() => setStarted(true)}>C'est parti ! 🚀</button>
      </div>}
    </div>
  )
}
