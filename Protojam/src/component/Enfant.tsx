import { useState, useEffect, useRef } from "react";
import "../style/Enfant.css";
import playerImg from "../assets/images/player.png";
import playerJump from "../assets/images/playerjump.png";
import playerDead from "../assets/images/playerdead.png";
import playerLost from "../assets/images/Emojilost.png";
import CactusImg from "../assets/images/cactus.png";

interface EnfantProps {
  code: string
}

interface Vars {
  vitesse: number;
  niveau: number;
  taille: number;
  obstacles: number;
  espace: number;
}

function parseVars(code: string): Vars {
  const vars: Vars = {
    vitesse: 3,
    niveau: 10,
    taille: 50,
    obstacles: 1,
    espace: 300,
  };
  for (const m of code.matchAll(/let\s+(\w+)\s*=\s*(.+?);/g)) {
    const key = m[1] as keyof Vars;
    const raw = m[2].trim().replace(/['"]/g, "");
    const val = isNaN(Number(raw)) ? raw : Number(raw);
    if (key in vars) {
      (vars[key] as string | number) = val;
    }
  }
  return vars;
}

function parseConditions(code: string, score: number, vars: Vars): Vars {
  const result = { ...vars }
  const m = code.match(/if\s*\(score\s*>\s*(\d+)\)\s*\{\s*vitesse\s*=\s*(\d+)/)
  if (m) {
    const seuil = Number(m[1])
    const nouvelleVitesse = Number(m[2])
    if (score > seuil) {
      result.vitesse = nouvelleVitesse
    }
  }
  return result
}

const GROUND = 220;
const OBS_W = 28;
const OBS_H = 40;


export default function Enfant({ code }: EnfantProps) {
  const vars = parseVars(code);
  const varsRef = useRef(vars);

  const [posY, setPosY] = useState<number>(GROUND);
  const [jumping, setJumping] = useState<boolean>(false);
  const [obstacles, setObstacles] = useState(
    Array.from({ length: vars.obstacles }, (_, i) => ({ x: 500 + i * 500 })),
  );
  const [win, setWin] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [dead, setDead] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);

  const jumpRef = useRef(false);
  const deadRef = useRef(false);
  const posYRef = useRef(GROUND);
  const scoredRef = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    varsRef.current = vars
  }, [vars])

  useEffect(() => {
    posYRef.current = posY;
  }, [posY]);

  useEffect(() => {
  scoreRef.current = score
}, [score])

  const doJump = () => {
    if (jumpRef.current || deadRef.current) return
    jumpRef.current = true
    setJumping(true)
    let py = GROUND
    let vy = -25 
    const gravity = 1
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
    }, 25)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        doJump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Boucle de jeu
useEffect(() => {
  if (!started || dead || win) return;
  deadRef.current = false;

  const loop = setInterval(() => {
    const v = parseConditions(code, scoreRef.current, varsRef.current);

    const speed = Math.min(Math.max(v.vitesse || 3, 1), 12);
    const taille = Math.min(Math.max(v.taille || 50, 20), 80);
    const numObs = Math.min(Math.max(Math.round(v.obstacles || 1), 1), 4);
    const espace = Math.min(Math.max(v.espace || 300, 100), 800);

    setObstacles((prev) => {
      let next = prev.map((o) => ({ x: o.x - speed }));

      // 🔥 COLLISION
      for (const o of next) {
        const hit =
          o.x < 60 + taille - 10 &&
          o.x + OBS_W > 60 + 10 &&
          posYRef.current + taille / 2 > GROUND - OBS_H + 5;

        if (hit) {
          deadRef.current = true;
          setDead(true);
          return prev;
        }
      }

      // 🔥 SCORE quand obstacle sort
      const nbSortants = next.filter((o) => o.x < -OBS_W).length;

      if (nbSortants > 0 && !scoredRef.current) {
        scoredRef.current = true;

        const newScore = scoreRef.current + 1;
        scoreRef.current = newScore;
        setScore(newScore);

        if (newScore >= v.niveau) {
          deadRef.current = true;
          setWin(true);
        }
      }

      if (nbSortants === 0) {
        scoredRef.current = false;
      }

      // 🔥 Reset obstacles
      next = next.map((o, i) => {
        if (o.x < -OBS_W) {
          const maxX = Math.max(...next.map((n) => n.x));
          return { x: maxX + espace + (i % numObs) * 80 };
        }
        return o;
      });

      while (next.length < numObs) {
        const maxX = Math.max(...next.map((n) => n.x), 500);
        next.push({ x: maxX + espace });
      }

      while (next.length > numObs) {
        next.pop();
      }

      return next;
    });

  }, 30);

  return () => clearInterval(loop);

}, [started, dead, win, code]);

  const taille = Math.min(Math.max(vars.taille || 50, 20), 80);

  const restart = () => {
    setStarted(false);
    setWin(false);
    setDead(false);
    deadRef.current = false;
    setScore(0);
    setPosY(GROUND);
    posYRef.current = GROUND;
    jumpRef.current = false;
    setJumping(false);
    setObstacles(
      Array.from({ length: varsRef.current.obstacles }, (_, i) => ({
        x: 500 + i * 300,
      })),
    );
  };

  return (
    <div className="ecran-enfant" onClick={doJump}>
      {/* Header */}
      <div className="enfant-header">
        <span>🎮 Ecran Enfant</span>
        <span>⭐ Score : {score}</span>
      </div>

      <div className="sol" />
      <div className="herbe" />

      {obstacles.map((o, i) => (
        <div key={i} className="obstacle" style={{ left: o.x }}>
          <img
            src={CactusImg}
            alt="obstacle"
            style={{ width: "70px", height: "80px" }}
          />
        </div>
      ))}

      {/* Joueur */}
      <div
        className="joueur"
        style={{
          bottom: 50 + (GROUND - posY),
          width: taille,
          height: taille,
          fontSize: taille * 0.5,
        }}
      >
        {dead ? (
          <img
            src={playerDead}
            alt="playerdead"
            style={{ width: `${vars.taille}px`, height: `${vars.taille}px` }}
          />
        ) : jumping ? (
          <img
            src={playerJump}
            alt="playerjump"
            style={{ width: `${vars.taille}px`, height: `${vars.taille}px` }}
          />
        ) : (
          <img
            src={playerImg}
            alt="player"
            style={{ width: `${vars.taille}px`, height: `${vars.taille}px` }}
          />
        )}
      </div>

      {/* Écran victoire */}
      {win && (
        <div className="overlay">
          <div>🏆</div>
          <p>Bravo ! Tu as gagné avec {score} points !</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setWin(false);
              restart();
            }}
          >
            Rejouer 🔄
          </button>
        </div>
      )}
      {/* Écran mort */}
      {dead && (
        <div className="overlay">
          <div>
            <img
              src={playerLost}
              alt="playerlost"
              style={{ width: "70px", height: "80px" }}
            />
          </div>
          <p>Perdu ! Score : {score}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              restart();
            }}
          >
            Rejouer 🔄
          </button>
        </div>
      )}

      {/* Écran démarrage */}
      {!started && (
        <div className="overlay">
          <div>🎮</div>
          <p>
            Appuie sur <strong>ESPACE</strong> ou touche ici !
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStarted(true);
            }}
          >
            C'est parti ! 🚀
          </button>
        </div>
      )}
    </div>
  );
}
