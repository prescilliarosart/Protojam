import "../style/Parent.css"

interface ParentProps {
  code: string
  setCode: (val: string) => void
}

const COULEURS_LIGNES = [
  "#f1c40f",  // jaune  → vitesse
  "#3498db",  // bleu   → couleur
  "#9b59b6",  // violet → taille
  "#e74c3c",  // rouge  → obstacles
]

export default function Parent({ code, setCode}: ParentProps) {
  return (
    <div className="ecran-parent">
      <div className="parent-titre">👨‍💻 Écran Parent</div>
      <div className="parent-aide">
        Change les valeurs pour aider (ou piéger 😈) ton enfant !<br />
        <span className="tag-jaune">vitesse</span> 1→12 &nbsp;
        <span className="tag-jaune">score</span> 1→40<br />
        <span className="tag-jaune">taille</span> 20→80 &nbsp;
        <span className="tag-jaune">obstacles</span> 1→4
      </div>

      <div className="editeur-wrapper">
        <div className="lignes-colorees">
          {code.split("\n").map((ligne, i) => (
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
      </div>

      <div className="parent-footer">
        ✏️ Modifie le code → le jeu change en direct
      </div>
    </div>
  )
}