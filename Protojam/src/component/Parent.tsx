
import "../style/Parent.css"

interface ParentProps {
 code:string
 setCode: (val:string) => void
}

      export default function Parent ({code, setCode}: ParentProps){
        return(
            <div className="Parent">
      <h2>👨‍💻Ecran Parent</h2>
      <textarea
      className="editeur"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      />
      </div>
        )
    
      }