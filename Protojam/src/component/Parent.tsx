import "../style/Parent.css"

interface ParentProps {
  code: string
  setCode: (val: string) => void
}

const COULEURS_LIGNES = [
  "#f1c40f",  // vitesse
  "#3498db",  // niveau
  "#9b59b6",  // taille
  "#e74c3c",  // obstacles
]

export default function Parent({ code, setCode }: ParentProps) {
  const lignes = code.split("\n")
  const niveau = parseInt(lignes[1] || "10", 10)

  const handleNiveauChange = (val: number) => {
    const nouvellesLignes = [...lignes]
    nouvellesLignes[1] = `let niveau = ${val};`
    setCode(nouvellesLignes.join("\n"))
  }

  return (
    <div className="ecran-parent">
      <div className="parent-titre">👨‍💻 Écran Parent</div>

      <div className="parent-aide">
        Change les valeurs pour aider (ou piéger 😈) ton enfant !<br />
        <span className="tag-jaune">vitesse</span> 1→12 &nbsp;
        <span className="tag-jaune">niveau</span> 10→20<br />
        <span className="tag-jaune">score</span> 1→40<br />
        <span className="tag-jaune">taille</span> 20→80 &nbsp;
        <span className="tag-jaune">obstacles</span> 1→4
      </div>

      <div className="editeur-wrapper">
        <div className="lignes-colorees">
          {lignes.map((ligne, i) => (
            <div
              key={i}
              className="ligne"
              style={{ color: COULEURS_LIGNES[i % COULEURS_LIGNES.length] }}
            >
              {ligne || ""}
            </div>
          ))}
        </div>

        <textarea
          className="editeur"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />

        <div className="slider-wrapper">
          <label>
            Niveau : {niveau}
            <input
              type="range"
              min={10}
              max={20}
              value={niveau}
              onChange={(e) => handleNiveauChange(parseInt(e.target.value, 10))}
            />
          </label>
        </div>
      </div>

      <div className="parent-footer">
        ✏️ Modifie le code → le jeu change en direct
      </div>
    </div>
  )
}
