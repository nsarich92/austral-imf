import { useState } from "react";
import ClienteForm from "./ClienteForm";
import AnalistaForm from "./AnalistaForm";
 
function App() {
  const [vista, setVista] = useState("home");
 
  if (vista === "cliente") return <ClienteForm onVolver={() => setVista("home")} />;
  if (vista === "analista") return <AnalistaForm onVolver={() => setVista("home")} />;
 
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f8" }}>
      <div style={{ maxWidth: 480, width: "100%", padding: "2rem" }}>
        <div style={{ borderLeft: "3px solid #1a56db", paddingLeft: "1rem", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".08em" }}>Austral Financial Consulting</p>
          <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "#111" }}>Diagnóstico de Madurez Financiera</p>
          <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Índice IMF Austral · Metodología propietaria</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setVista("cliente")} style={btnStyle("#1a56db")}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 500 }}>Soy cliente</p>
              <p style={{ margin: 0, fontSize: 13, opacity: .8 }}>Diagnóstico inicial · 15 minutos · 19 preguntas</p>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </button>
          <button onClick={() => setVista("analista")} style={btnStyle("#dc2626")}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 500 }}>Soy analista</p>
              <p style={{ margin: 0, fontSize: 13, opacity: .8 }}>Relevamiento avanzado · 90 minutos · 22 preguntas</p>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </button>
        </div>
        <p style={{ marginTop: "2rem", fontSize: 11, color: "#aaa", textAlign: "center" }}>
          Sus respuestas son confidenciales y se usan exclusivamente para generar el informe de diagnóstico.
        </p>
      </div>
    </div>
  );
}
 
function btnStyle(color) {
  return {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1.25rem 1.5rem", borderRadius: 12, cursor: "pointer", textAlign: "left",
    border: `1.5px solid ${color}22`, background: "#fff", color: "#111",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all .15s",
  };
}
 
export default App;