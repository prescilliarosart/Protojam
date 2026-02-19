import {useState, useEffect, useRef } from "react"
import "../style/Enfant.css"
import playerImg from "../assets/images/player.png"
import playerJump from "../assets/images/playerjump.png"
import playerDead from "../assets/images/playerdead.png"
import playerLost from "../assets/images/Emojilost.png"
import CactusImg from "../assets/images/cactus.png"

interface EnfantProps {
    code:string
}

function parseVars(code: string) {
    const vars: Record<string, any> = {
    vitesse: 3,
    couleur: "rouge",
    taille: 50,
  }
  for (const m of code.matchAll(/let\s+(\w+)\s=\s(.+?);/g)) {
    let val: any = m[2].trim().replace(/['"]/g, "")
    if (!isNaN(val)) val = Number(val)
    vars[m[1]] = val
  }
  return vars
}

const GROUND = 220
const OBS_W = 28
const OBS_H = 40

export default function Enfant ({code}: EnfantProps ) {
    const vars = parseVars(code)
    const varsRef = useRef(vars)

  const [posX, setPosX] = useState<number>(60)
  const [posY, setPosY] = useState<number>(GROUND)
  const [jumping, setJumping] = useState<boolean>(false)
  const [obstacles, setObstacles] = useState([{ x: 500 }, { x: 800 }])
  const [score, setScore] = useState<number>(0)
  const [dead, setDead] = useState<boolean>(false)
  const [started, setStarted] = useState<boolean>(false)

  const jumpRef = useRef(false)
  const deadRef = useRef(false)
  const posYRef = useRef(GROUND)

  useEffect(() => {
    varsRef.current = vars
  }, [vars.vitesse, vars.taille, vars.obstacles])

  useEffect(() => {
    posYRef.current = posY
  }, [posY])

  // Saut
  const doJump = () => {
    if (jumpRef.current || deadRef.current) return
    jumpRef.current = true
    setJumping(true)
    let py = GROUND
    let up = true
    const t = setInterval(() => {
      py = up ? py - 14 : py + 7
      if (py <= 40) up = false
      if (py >= GROUND) {
        py = GROUND
        jumpRef.current = false
        setJumping(false)
        clearInterval(t)
      }
      setPosY(py)
    }, 25)
  }

  // Espace pour sauter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); doJump() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Boucle de jeu
  useEffect(() => {
    if (!started || dead) return
    deadRef.current = false

    const loop = setInterval(() => {
      const v = varsRef.current
      const speed = Math.min(Math.max(v.vitesse || 3, 1), 12)
      const taille = Math.min(Math.max(v.taille || 50, 20), 80)

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
        next = next.map(o => {
          if (o.x < -OBS_W) {
            setScore(s => s + 1)
            const maxX = Math.max(...next.map(n => n.x))
            return { x: maxX + 200 + Math.random() * 100 }
          }
          return o
        })

        return next
      })
    }, 30)

    return () => clearInterval(loop)
  }, [started, dead])

  const taille = Math.min(Math.max(vars.taille || 50, 20), 80)

  const restart = () => {
    setDead(false)
    deadRef.current = false
    setScore(0)
    setPosY(GROUND)
    posYRef.current = GROUND
    jumpRef.current = false
    setJumping(false)
    setObstacles([{ x: 500 }, { x: 800 }])
  }

  return (
    <div className="ecran-enfant" onClick={doJump}>

      {/* Header */}
      <div className="enfant-header">
        <span>🎮 Ecran Enfant</span>
        <span>⭐ Score : {score}</span>
      </div>

      {/* Sol */}
      <div className="sol" />
      <div className="herbe" />

      {/* Obstacles */}
      {obstacles.map((o, i) => (
        <div key={i} className="obstacle" style={{ left: o.x }}><img src= {CactusImg} alt="obstacle" style={{width:"70px", height:"80px"}}/></div>
      ))}

      {/* Joueur */}
      <div className="joueur" style={{
        bottom: 50 + (GROUND - posY),
        width: taille,
        height: taille,
        fontSize: taille * 0.5,
      }}>
        {dead ? <img src = {playerDead} alt="playerdead" style={{width:`${vars.taille}px`, height: `${vars.taille}px`}}/> : jumping ? <img src = {playerJump} alt="playerjump" style={{width:`${vars.taille}px`, height: `${vars.taille}px`}}/> : <img src = {playerImg} alt="player" style={{width:`${vars.taille}px`, height: `${vars.taille}px`}}/>}
      </div>

      {/* Écran mort */}
      {dead && (
        <div className="overlay">
          <div><img src= {playerLost} alt="playerlost" style={{width:"70px", height:"80px"}}/></div>
          <p>Perdu ! Score : {score}</p>
          <button onClick={(e) => { e.stopPropagation(); restart() }}>
            Rejouer 🔄
          </button>
        </div>
      )}

      {/* Écran démarrage */}
      {!started && (
        <div className="overlay">
          <div>🎮</div>
          <p>Appuie sur <strong>ESPACE</strong> ou touche ici !</p>
          <button onClick={(e) => { e.stopPropagation(); setStarted(true) }}>
            C'est parti ! 🚀
          </button>
        </div>
      )}

    </div>
  )
}