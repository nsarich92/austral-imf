import { useState, useMemo } from "react";
 
const Q = [
  { id: "emp", s: "Información de la empresa", t: "all", d: null, q: "¿Cuántas personas trabajan en su empresa?", o: [{ l: "1 a 4 personas", v: 0 }, { l: "5 a 20 personas", v: 1 }, { l: "21 a 50 personas", v: 2 }, { l: "Más de 50 personas", v: 3 }] },
  { id: "rev", s: "Información de la empresa", t: "all", d: null, q: "¿Cuál es la facturación anual aproximada?", o: [{ l: "Menos de USD 100.000 al año", v: "micro" }, { l: "USD 100.000 a 500.000", v: "small" }, { l: "USD 500.000 a 2.000.000", v: "mid" }, { l: "Más de USD 2.000.000", v: "large" }] },
  { id: "sec", s: "Información de la empresa", t: "all", d: null, q: "¿En qué sector opera su empresa?", o: [{ l: "Comercio y distribución", v: "comercio" }, { l: "Servicios profesionales y tecnología", v: "servicios" }, { l: "Industria y manufactura", v: "industria" }, { l: "Construcción e inmobiliario", v: "construccion" }] },
  { id: "plan", s: "Estrategia y Gobernanza", t: "all", d: "est", q: "¿Su empresa tiene un plan financiero o presupuesto para este año?", o: [{ l: "No. Las decisiones se toman día a día", v: 0 }, { l: "Tenemos una idea general, pero no está escrita", v: 33 }, { l: "Sí, tenemos un presupuesto básico en planilla", v: 66 }, { l: "Sí, con metas, escenarios y seguimiento mensual", v: 100 }] },
  { id: "resp", s: "Estrategia y Gobernanza", t: "all", d: "est", q: "¿Quién toma las decisiones financieras importantes?", o: [{ l: "El dueño o socio, sin apoyo financiero formal", v: 0 }, { l: "El dueño, apoyado por un contador para impuestos", v: 33 }, { l: "Hay un área de administración o finanzas interna", v: 66 }, { l: "Hay un gerente financiero o CFO dedicado", v: 100 }] },
  { id: "proc", s: "Estrategia y Gobernanza", t: "std", d: "est", q: "¿Los procesos financieros están documentados?", o: [{ l: "No existen procesos formales", v: 0 }, { l: "Existen informalmente, no están escritos", v: 33 }, { l: "Algunos procesos clave están documentados", v: 66 }, { l: "Todos documentados y actualizados regularmente", v: 100 }] },
  { id: "res", s: "Planificación y Análisis", t: "all", d: "pla", q: "¿Con qué frecuencia revisa los resultados financieros?", o: [{ l: "Nunca, o solo ante problemas urgentes", v: 0 }, { l: "Una o dos veces al año", v: 33 }, { l: "Cada trimestre", v: 66 }, { l: "Todos los meses", v: 100 }] },
  { id: "proy", s: "Planificación y Análisis", t: "all", d: "pla", q: "¿Tiene proyecciones de ingresos y gastos para los próximos 3 a 6 meses?", o: [{ l: "No trabajamos con proyecciones", v: 0 }, { l: "Mentalmente sí, pero no documentado", v: 33 }, { l: "Sí, en una planilla básica", v: 66 }, { l: "Sí, con múltiples escenarios y actualización regular", v: 100 }] },
  { id: "kpi", s: "Planificación y Análisis", t: "std", d: "pla", q: "¿Utiliza indicadores financieros para monitorear el negocio?", o: [{ l: "No uso este tipo de indicadores", v: 0 }, { l: "Los conozco pero no los calculo regularmente", v: 33 }, { l: "Calculo 2 o 3 indicadores básicos", v: 66 }, { l: "Tenemos un tablero de indicadores mensual", v: 100 }] },
  { id: "caj", s: "Tesorería y Liquidez", t: "all", d: "tes", q: "¿Cómo controla el flujo de dinero de su empresa?", o: [{ l: "Reviso el saldo bancario cuando surge una necesidad", v: 0 }, { l: "Tengo un control general sin mucho detalle", v: 33 }, { l: "Registro todos los movimientos en una planilla", v: 66 }, { l: "Tengo proyección de caja a 30-90 días con seguimiento activo", v: 100 }] },
  { id: "ctas", s: "Tesorería y Liquidez", t: "all", d: "tes", q: "¿Las finanzas de la empresa están separadas de las del dueño?", o: [{ l: "No, se mezclan habitualmente", v: 0 }, { l: "A veces se mezclan, estamos ordenando", v: 33 }, { l: "Están separadas aunque sin política formal", v: 66 }, { l: "Completamente separadas, con política documentada", v: 100 }] },
  { id: "liq", s: "Tesorería y Liquidez", t: "all", d: "tes", q: "Si sus ingresos se detuvieran hoy, ¿cuánto tiempo podría operar?", o: [{ l: "Menos de 15 días", v: 0 }, { l: "Entre 15 y 30 días", v: 33 }, { l: "Entre 1 y 3 meses", v: 66 }, { l: "Más de 3 meses", v: 100 }] },
  { id: "cos", s: "Costos y Rentabilidad", t: "all", d: "cos", q: "¿Conoce el costo exacto de cada producto o servicio que ofrece?", o: [{ l: "No, estimo los costos de forma global", v: 0 }, { l: "Tengo una idea aproximada por producto", v: 33 }, { l: "Sí, de los principales productos o servicios", v: 66 }, { l: "Sí, de todos, con actualización periódica", v: 100 }] },
  { id: "rent", s: "Costos y Rentabilidad", t: "all", d: "cos", q: "¿Sabe cuál de sus productos o clientes le genera más GANANCIA?", o: [{ l: "No tengo esa información", v: 0 }, { l: "Lo intuyo, sin datos para confirmarlo", v: 33 }, { l: "Tengo datos parciales para algunas líneas", v: 66 }, { l: "Sí, con datos actualizados por línea de negocio", v: 100 }] },
  { id: "gcont", s: "Costos y Rentabilidad", t: "std", d: "cos", q: "¿Tiene un proceso formal para controlar los gastos?", o: [{ l: "No, los gastos se aprueban sin proceso definido", v: 0 }, { l: "Reviso los gastos ocasionalmente", v: 33 }, { l: "Hay revisión mensual sin presupuesto de referencia", v: 66 }, { l: "Hay presupuesto, límites de gasto y aprobaciones definidas", v: 100 }] },
  { id: "tool", s: "Operaciones y Tecnología", t: "all", d: "ope", q: "¿Qué herramientas usa para gestionar las finanzas?", o: [{ l: "Solo planillas de Excel o papel", v: 0 }, { l: "Excel más algún sistema básico de facturación", v: 33 }, { l: "Software de gestión o sistema contable", v: 66 }, { l: "Sistema integrado (contabilidad + stock + bancos)", v: 100 }] },
  { id: "ases", s: "Operaciones y Tecnología", t: "all", d: "ope", q: "¿Con qué soporte financiero externo cuenta?", o: [{ l: "Sin soporte formal", v: 0 }, { l: "Contador solo para temas impositivos", v: 33 }, { l: "Contador de gestión o asesor financiero externo", v: 66 }, { l: "Equipo financiero propio más asesoría especializada", v: 100 }] },
  { id: "conf", s: "Operaciones y Tecnología", t: "all", d: "ope", q: "¿Qué tan confiables son los datos financieros que maneja hoy?", o: [{ l: "No confío en los datos que tenemos", v: 0 }, { l: "Son aproximados, con errores frecuentes", v: 33 }, { l: "Generalmente correctos pero tardan en estar disponibles", v: 66 }, { l: "Precisos y disponibles cuando los necesito", v: 100 }] },
  { id: "cred", s: "Financiamiento", t: "std", d: "fin", q: "¿Tiene acceso a crédito o financiamiento cuando lo necesita?", o: [{ l: "No, no tenemos acceso a crédito formal", v: 0 }, { l: "Acceso muy limitado y con condiciones costosas", v: 33 }, { l: "Acceso moderado, alguna línea bancaria disponible", v: 66 }, { l: "Amplio acceso, múltiples fuentes con condiciones competitivas", v: 100 }] },
  { id: "deu", s: "Financiamiento", t: "std", d: "fin", q: "¿Conoce y gestiona activamente el endeudamiento de su empresa?", o: [{ l: "No tengo un registro claro de las deudas", v: 0 }, { l: "Conozco las deudas pero no las gestiono activamente", v: 33 }, { l: "Registro la deuda y controlo los vencimientos", v: 66 }, { l: "Gestión activa: monitoreamos y optimizamos costos financieros", v: 100 }] },
];
 
const DM = {
  est: { n: "Estrategia y Gobernanza", c: "#1a56db" },
  pla: { n: "Planificación y Análisis", c: "#7c3aed" },
  tes: { n: "Tesorería y Liquidez", c: "#0891b2" },
  cos: { n: "Costos y Rentabilidad", c: "#d97706" },
  ope: { n: "Operaciones y Tecnología", c: "#059669" },
  fin: { n: "Financiamiento", c: "#dc2626" },
};
 
const RECS = {
  est: [{ ms: 25, t: "Asignar un responsable financiero", a: "Designar quién controla las finanzas y documentar 3 políticas básicas: aprobación de gastos, cobros y pagos.", imp: "Muy alto" }, { ms: 50, t: "Crear el primer presupuesto anual", a: "Elaborar un presupuesto base con seguimiento mensual.", imp: "Alto" }, { ms: 75, t: "Formalizar la gobernanza financiera", a: "Implementar un tablero de control mensual y documentar los procesos financieros clave.", imp: "Medio" }],
  pla: [{ ms: 25, t: "Implementar cierre mensual de resultados", a: "Crear un estado de resultados mensual. Sin saber cuánto gana o pierde cada mes, es imposible tomar decisiones correctas.", imp: "Muy alto" }, { ms: 50, t: "Desarrollar proyecciones financieras", a: "Construir un modelo de proyección a 6 meses con escenario base y conservador.", imp: "Alto" }, { ms: 75, t: "Incorporar un tablero de indicadores", a: "Definir 5 KPIs clave y publicarlos mensualmente a la dirección.", imp: "Medio" }],
  tes: [{ ms: 25, t: "Crear una proyección de flujo de caja", a: "El 82% de las quiebras de PYMES ocurren por liquidez. Saber cuándo entra y sale el dinero es no negociable.", imp: "Muy alto" }, { ms: 50, t: "Separar y formalizar las finanzas", a: "Formalizar la separación de cuentas y calcular el capital de trabajo mínimo necesario.", imp: "Alto" }, { ms: 75, t: "Optimizar el ciclo de cobro y pago", a: "Reducir el desfasaje entre cobro y pago mejora la liquidez sin necesidad de crédito externo.", imp: "Medio" }],
  cos: [{ ms: 25, t: "Mapear la estructura de costos", a: "Identificar y clasificar TODOS los costos: fijos vs variables, directos vs indirectos.", imp: "Muy alto" }, { ms: 50, t: "Calcular rentabilidad por línea de negocio", a: "Muchas empresas trabajan más para ganar menos porque no saben dónde está la ganancia real.", imp: "Alto" }, { ms: 75, t: "Implementar control presupuestario", a: "Establecer límites mensuales por área y reportar desvíos.", imp: "Medio" }],
  ope: [{ ms: 25, t: "Centralizar la gestión financiera", a: "Migrar de planillas dispersas a un sistema o archivo único.", imp: "Alto" }, { ms: 50, t: "Mejorar la confiabilidad de los datos", a: "Implementar un cierre mensual: conciliar bancos, verificar registros, validar antes de decidir.", imp: "Alto" }, { ms: 75, t: "Automatizar procesos repetitivos", a: "Identificar las 3 tareas financieras que más tiempo consumen y automatizarlas.", imp: "Medio" }],
  fin: [{ ms: 25, t: "Construir un perfil crediticio", a: "Ordenar estados financieros y comenzar relación formal con al menos 2 entidades bancarias.", imp: "Alto" }, { ms: 50, t: "Acceder a financiamiento preventivo", a: "Explorar líneas de crédito antes de necesitarlas. El crédito de emergencia siempre es el más caro.", imp: "Medio" }, { ms: 75, t: "Optimizar la estructura de deuda", a: "Revisar tasas y vencimientos. Refinanciar pasivos costosos libera capital para reinversión.", imp: "Medio" }],
};
 
function getRec(d, s) { return (RECS[d] || []).find(r => s <= r.ms) || null; }
 
function lvl(s) {
  if (s <= 25) return { label: "Sin desarrollar", c: "#ef4444" };
  if (s <= 50) return { label: "En desarrollo", c: "#f97316" };
  if (s <= 75) return { label: "Maduro", c: "#f59e0b" };
  return { label: "Optimizado", c: "#10b981" };
}
 
function ClienteForm({ onVolver }) {
  const [ph, setPh] = useState("w");
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState({});
  const [trk, setTrk] = useState("b");
  const [sel, setSel] = useState(null);
  const [co, setCo] = useState("");
 
  const qs = useMemo(() => Q.filter(q => q.t === "all" || (trk === "s" && q.t === "std")), [trk]);
  const q = qs[idx];
  const pct = qs.length ? Math.round((idx / qs.length) * 100) : 0;
 
  function next() {
    if (!sel) return;
    if (q.id === "emp" && typeof sel.v === "number" && sel.v >= 1) setTrk("s");
    setAns(a => ({ ...a, [q.id]: sel }));
    setSel(null);
    if (idx + 1 >= qs.length) setPh("r");
    else setIdx(i => i + 1);
  }
 
  function back() {
    if (idx === 0) { setPh("w"); setIdx(0); setAns({}); setTrk("b"); setSel(null); return; }
    setIdx(i => i - 1); setSel(null);
  }
 
  const res = useMemo(() => {
    if (ph !== "r") return null;
    const sc = {}, cn = {};
    qs.forEach(({ id, d }) => {
      const a = ans[id]; if (!d || !a || typeof a.v !== "number") return;
      sc[d] = (sc[d] || 0) + a.v; cn[d] = (cn[d] || 0) + 1;
    });
    const dims = Object.fromEntries(Object.keys(sc).map(d => [d, Math.round(sc[d] / cn[d])]));
    const ks = Object.keys(dims);
    const imf = ks.length ? Math.round(ks.reduce((s, d) => s + dims[d], 0) / ks.length) : 0;
    const recs = [...ks].sort((a, b) => dims[a] - dims[b]).slice(0, 3).map(d => { const r = getRec(d, dims[d]); return r ? { ...r, d, ds: dims[d] } : null; }).filter(Boolean);
    return { dims, imf, recs };
  }, [ph, ans, qs]);
 
  const S = { maxWidth: 560, margin: "0 auto", padding: "1.5rem 1rem", fontFamily: "system-ui, sans-serif" };
 
  if (ph === "w") return (
    <div style={S}>
      <button onClick={onVolver} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#888", marginBottom: "1.5rem", padding: 0 }}>← Volver</button>
      <div style={{ borderLeft: "3px solid #1a56db", paddingLeft: "1rem", marginBottom: "2rem" }}>
        <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".08em" }}>Austral Financial Consulting</p>
        <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Diagnóstico financiero inicial</p>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>15 minutos · Confidencial · Resultados inmediatos</p>
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Nombre de la empresa (opcional)</label>
        <input type="text" placeholder="Ej: Mi Empresa S.A." value={co} onChange={e => setCo(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1px solid #e5e7eb", outline: "none" }} />
      </div>
      <button onClick={() => setPh("q")} style={{ width: "100%", padding: "12px", fontSize: 15, borderRadius: 8, cursor: "pointer", background: "#1a56db", color: "#fff", border: "none", fontWeight: 500 }}>Comenzar diagnóstico →</button>
    </div>
  );
 
  if (ph === "q") return (
    <div style={S}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ fontSize: 11, background: "#eff6ff", color: "#1a56db", padding: "3px 10px", borderRadius: 6, fontWeight: 500 }}>{q.s}</span>
        <span style={{ fontSize: 12, color: "#888" }}>{idx + 1} / {qs.length}</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 4, height: 3, marginBottom: "1.5rem" }}>
        <div style={{ background: "#1a56db", borderRadius: 4, height: 3, width: pct + "%" }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, marginBottom: "1.5rem" }}>{q.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
        {q.o.map((opt, i) => {
          const isSel = sel && sel.l === opt.l;
          return (
            <button key={i} onClick={() => setSel({ v: opt.v, l: opt.l })} style={{ textAlign: "left", padding: "13px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, lineHeight: 1.55, display: "flex", alignItems: "center", gap: 10, width: "100%", border: isSel ? "2px solid #1a56db" : "1px solid #e5e7eb", background: isSel ? "#eff6ff" : "#fff", color: isSel ? "#1a56db" : "#111" }}>
              <span style={{ minWidth: 20, height: 20, borderRadius: "50%", border: isSel ? "2px solid #1a56db" : "1.5px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isSel ? "#1a56db" : "transparent" }}>
                {isSel && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
              </span>
              {opt.l}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={back} style={{ padding: "10px 18px", fontSize: 13, color: "#888", background: "none", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}>← Atrás</button>
        <button onClick={next} disabled={!sel} style={{ flex: 1, padding: "11px", fontSize: 14, borderRadius: 8, cursor: sel ? "pointer" : "not-allowed", opacity: sel ? 1 : 0.35, background: "#1a56db", color: "#fff", border: "none", fontWeight: 500 }}>
          {idx + 1 === qs.length ? "Ver resultados →" : "Siguiente →"}
        </button>
      </div>
    </div>
  );
 
  if (!res) return null;
  const { dims, imf, recs } = res;
  const lv = lvl(imf);
 
  return (
    <div style={S}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".08em" }}>{co || "Su empresa"} · Diagnóstico Austral</p>
        <p style={{ fontSize: 18, fontWeight: 500, margin: "0 0 1.5rem" }}>Índice de Madurez Financiera</p>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "1.5rem 3rem", border: "1px solid #e5e7eb", borderRadius: 14, background: "#fafafa" }}>
          <span style={{ fontSize: 52, fontWeight: 500, color: lv.c, lineHeight: 1 }}>{imf}</span>
          <span style={{ fontSize: 12, color: "#888" }}>de 100</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: lv.c, padding: "4px 14px", borderRadius: 20, background: lv.c + "22" }}>{lv.label}</span>
        </div>
      </div>
      <div style={{ background: "#f9f9f8", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <p style={{ margin: "0 0 1rem", fontSize: 13, fontWeight: 500 }}>Resultado por dimensión</p>
        {Object.entries(dims).sort((a, b) => a[1] - b[1]).map(([d, s]) => {
          const meta = DM[d] || { n: d, c: "#888" };
          const lvi = lvl(s);
          return (
            <div key={d} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13 }}>{meta.n}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: lvi.c }}>{s} · {lvi.label}</span>
              </div>
              <div style={{ background: "#e5e7eb", borderRadius: 4, height: 6 }}>
                <div style={{ background: lvi.c, borderRadius: 4, height: 6, width: s + "%" }} />
              </div>
            </div>
          );
        })}
      </div>
      {recs.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ margin: "0 0 1rem", fontSize: 13, fontWeight: 500 }}>Las 3 acciones prioritarias</p>
          {recs.map((r, i) => {
            const lvi = lvl(r.ds);
            const impC = r.imp === "Muy alto" ? "#ef4444" : r.imp === "Alto" ? "#f97316" : "#f59e0b";
            return (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", borderLeft: "3px solid " + lvi.c, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: lvi.c + "22", color: lvi.c, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{r.t}</span>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: impC + "18", color: impC, flexShrink: 0, marginLeft: 8 }}>{r.imp}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.65, paddingLeft: 32 }}>{r.a}</p>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ background: "#eff6ff", borderRadius: 12, padding: "1.5rem", textAlign: "center", border: "1px solid #bfdbfe" }}>
        <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 500, color: "#1a56db" }}>¿Quiere convertir este diagnóstico en un plan de acción concreto?</p>
        <p style={{ margin: "0 0 1rem", fontSize: 13, color: "#3b82f6", lineHeight: 1.5 }}>Nuestro equipo prepara un informe completo con benchmarks de industria y un plan de transformación a 90 días.</p>
        <a href="mailto:contacto@australconsulting.com" style={{ display: "inline-block", padding: "10px 24px", fontSize: 14, background: "#1a56db", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>Hablar con un especialista →</a>
      </div>
    </div>
  );
}
 
function App() {
  const [vista, setVista] = useState("home");
  if (vista === "cliente") return <ClienteForm onVolver={() => setVista("home")} />;
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f8" }}>
      <div style={{ maxWidth: 480, width: "100%", padding: "2rem" }}>
        <div style={{ borderLeft: "3px solid #1a56db", paddingLeft: "1rem", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".08em" }}>Austral Financial Consulting</p>
          <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "#111" }}>Diagnóstico de Madurez Financiera</p>
          <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Índice IMF Austral · Metodología propietaria</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setVista("cliente")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderRadius: 12, cursor: "pointer", textAlign: "left", border: "1.5px solid #1a56db33", background: "#fff", color: "#111" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 500 }}>Soy cliente</p>
              <p style={{ margin: 0, fontSize: 13, opacity: .8 }}>Diagnóstico inicial · 15 minutos · 19 preguntas</p>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </button>
        </div>
        <p style={{ marginTop: "2rem", fontSize: 11, color: "#aaa", textAlign: "center" }}>Sus respuestas son confidenciales.</p>
      </div>
    </div>
  );
}
 
export default App;