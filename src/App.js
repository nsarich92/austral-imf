import { useState, useMemo } from "react";

const PASS = "Austral2026";

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

const DA = [
  { id: "g", lb: "Gobernanza", cl: "#1a56db", ss: [
    { id: "g1", sb: "Alineación estratégica", q: "¿Las decisiones financieras están alineadas con los objetivos del negocio?", dt: "Buscar: plan estratégico, presupuesto aprobado, actas con objetivos financieros.", ev: ["Plan estratégico", "Presupuesto aprobado", "Actas de directorio"], nt: "¿Qué 3 objetivos financieros tiene la empresa este año?", os: [{ v: 0, d: "Sin objetivos documentados. Decisiones reactivas." }, { v: 33, d: "Objetivos informales sin métricas ni presupuesto." }, { v: 66, d: "Plan con objetivos medibles. Decisiones alineadas." }, { v: 100, d: "Finanzas co-diseña la estrategia. Revisiones trimestrales." }] },
    { id: "g2", sb: "Gobernanza y límites", q: "¿Existen estructuras formales de supervisión y aprobación financiera?", dt: "Verificar límites de aprobación por monto y roles en decisiones de gasto.", ev: ["Manual de autorizaciones", "Organigrama financiero", "Política de gastos"], nt: "¿Quién aprueba una compra de USD 5k? ¿Y USD 50k?", os: [{ v: 0, d: "Una persona decide todo sin respaldo." }, { v: 33, d: "Noción informal no escrita ni consistente." }, { v: 66, d: "Niveles de aprobación documentados y respetados." }, { v: 100, d: "Gobernanza formalizada con matriz de autorización." }] },
    { id: "g3", sb: "Procesos documentados", q: "¿Los procesos financieros clave tienen responsables y documentación?", dt: "Buscar manuales, procedimientos de cierre mensual, cobranzas, pagos.", ev: ["Manuales de procedimiento", "Descripciones de puesto", "Checklist cierre mensual"], nt: "¿Cuánto tarda el cierre? ¿Puede otra persona hacerlo si falta el responsable?", os: [{ v: 0, d: "Sin documentación. Conocimiento en una sola persona." }, { v: 33, d: "Apuntes informales sin estructura ni responsable." }, { v: 66, d: "Procesos principales documentados con responsable." }, { v: 100, d: "Todos documentados, versionados y revisados." }] },
    { id: "g4", sb: "Controles internos", q: "¿Existen controles para prevenir errores o fraudes?", dt: "Verificar segregación de funciones, conciliaciones periódicas, accesos diferenciados.", ev: ["Política de control interno", "Reportes de conciliación", "Permisos en sistemas"], nt: "¿La misma persona que registra también aprueba?", os: [{ v: 0, d: "Una persona maneja todo sin revisión independiente." }, { v: 33, d: "Controles informales no sistemáticos." }, { v: 66, d: "Segregación básica, conciliaciones regulares." }, { v: 100, d: "Marco de control robusto con auditoría periódica." }] },
  ]},
  { id: "p", lb: "Planificación", cl: "#7c3aed", ss: [
    { id: "p1", sb: "Estados financieros", q: "¿Se producen estados financieros confiables y en tiempo oportuno?", dt: "Solicitar último EERR y balance. Verificar fecha y nivel de detalle.", ev: ["Estado de resultados", "Balance general", "Cash flow histórico"], nt: "¿Cuántos días post-cierre está disponible?", os: [{ v: 0, d: "No existen. Información dispersa sin consolidar." }, { v: 33, d: "EERR básico con retraso o errores." }, { v: 66, d: "EERR mensual confiable en 10 días del cierre." }, { v: 100, d: "EERR+balance+CF mensuales en menos de 5 días." }] },
    { id: "p2", sb: "Presupuesto y forecast", q: "¿Existe un presupuesto formal con seguimiento regular de desvíos?", dt: "Verificar presupuesto anual y comparativo real vs presupuesto.", ev: ["Presupuesto anual", "Reporte de desvíos", "Forecast actualizado"], nt: "¿Cómo se enteran si un área gastó 20% más de lo presupuestado?", os: [{ v: 0, d: "Sin presupuesto. Gastos sin referencia." }, { v: 33, d: "Presupuesto básico que no se compara ni actualiza." }, { v: 66, d: "Presupuesto anual con seguimiento mensual." }, { v: 100, d: "Presupuesto + rolling forecast + causa raíz." }] },
    { id: "p3", sb: "Análisis e insights", q: "¿El análisis financiero genera conclusiones accionables?", dt: "Evaluar si los reportes contienen análisis o solo datos.", ev: ["Reportes gerenciales", "Análisis de márgenes", "Presentaciones a dirección"], nt: "¿Cuándo fue la última vez que un análisis cambió una decisión comercial?", os: [{ v: 0, d: "Solo se registra lo ocurrido sin interpretación." }, { v: 33, d: "Comentarios informales sin periodicidad." }, { v: 66, d: "Reportes mensuales con tendencias que llegan a dirección." }, { v: 100, d: "Análisis predictivo. Cultura data-driven activa." }] },
    { id: "p4", sb: "KPIs y tablero", q: "¿La empresa monitorea indicadores financieros clave de forma regular?", dt: "Verificar si hay dashboard con KPIs definidos, frecuencia y responsable.", ev: ["Dashboard de KPIs", "Reportes mensuales", "Actas con métricas revisadas"], nt: "¿Cuáles son los 3 indicadores que dirección revisa mensualmente?", os: [{ v: 0, d: "Sin KPIs definidos ni medidos." }, { v: 33, d: "1-2 métricas básicas sin seguimiento formal." }, { v: 66, d: "5+ KPIs medidos mensualmente y comunicados." }, { v: 100, d: "Tablero completo con alertas automáticas." }] },
  ]},
  { id: "t", lb: "Tesorería", cl: "#0891b2", ss: [
    { id: "t1", sb: "Proyección de caja", q: "¿La empresa proyecta y controla sus flujos de efectivo activamente?", dt: "Verificar existencia de proyección de caja, horizonte y comparación con lo real.", ev: ["Proyección de cash flow", "Registro de movimientos", "Conciliación bancaria"], nt: "¿Hubo algún mes en el último año en que no pudieron pagar en tiempo?", os: [{ v: 0, d: "Sin proyección. Se revisa el saldo ante urgencias." }, { v: 33, d: "Proyección informal a 15-30 días sin análisis." }, { v: 66, d: "Proyección a 60-90 días actualizada semanalmente." }, { v: 100, d: "Cash flow a 6+ meses con escenarios de stress." }] },
    { id: "t2", sb: "Capital de trabajo", q: "¿Se mide y gestiona el plazo de cobro, pago e inventario?", dt: "Calcular DSO, DPO y DIO. Si no se pueden calcular, eso ya es información.", ev: ["Aging de deudores", "Aging de proveedores", "Detalle de inventario"], nt: "¿Cuántos días tarda en cobrar una factura? ¿A cuántos días paga?", os: [{ v: 0, d: "No se calculan. Sin política definida." }, { v: 33, d: "Plazos conocidos informalmente pero no medidos." }, { v: 66, d: "DSO, DPO y DIO calculados mensualmente." }, { v: 100, d: "Ciclo de caja optimizado con early payment." }] },
    { id: "t3", sb: "Reservas de liquidez", q: "¿La empresa mantiene reservas para cubrir imprevistos operativos?", dt: "Calcular meses de gastos fijos cubiertos por activos líquidos disponibles.", ev: ["Extractos bancarios", "Inversiones a corto plazo", "Líneas de crédito"], nt: "¿Cuál es el saldo promedio mensual? ¿Hay líneas preaprobadas?", os: [{ v: 0, d: "Menos de 15 días. Opera al límite permanente." }, { v: 33, d: "15-30 días. Alta vulnerabilidad ante imprevistos." }, { v: 66, d: "1-3 meses de cobertura con línea de respaldo." }, { v: 100, d: "Más de 3 meses. Portfolio de liquidez diversificado." }] },
    { id: "t4", sb: "Separación patrimonial", q: "¿Las finanzas de la empresa están separadas de las de los socios?", dt: "Revisar extractos bancarios buscando transferencias sin justificación.", ev: ["Extractos bancarios", "Préstamos a socios documentados", "Política de retiros"], nt: "¿Los retiros de socios están documentados como dividendos o préstamos?", os: [{ v: 0, d: "Mezcla total. Fondos empresa y dueño indistinguibles." }, { v: 33, d: "Separación parcial. Movimientos sin justificación." }, { v: 66, d: "Cuentas separadas. Retiros documentados formalmente." }, { v: 100, d: "Separación completa con política de distribución formal." }] },
  ]},
  { id: "c", lb: "Costos", cl: "#d97706", ss: [
    { id: "c1", sb: "Clasificación de costos", q: "¿Los costos están identificados, clasificados y asignados correctamente?", dt: "Verificar diferenciación fijos/variables y directos/indirectos por línea de negocio.", ev: ["Plan de cuentas contable", "Costos por área", "EERR detallado"], nt: "¿Puede calcular el costo de un servicio específico ahora mismo?", os: [{ v: 0, d: "Sin clasificación. Todo en una única categoría." }, { v: 33, d: "Clasificación básica sin asignación por línea." }, { v: 66, d: "Costos clasificados y asignados a centros de costo." }, { v: 100, d: "Costeo detallado a nivel de cliente o producto." }] },
    { id: "c2", sb: "Rentabilidad por línea", q: "¿Se conoce la rentabilidad real de cada producto, servicio o cliente?", dt: "Solicitar análisis de contribución marginal por línea.", ev: ["Margen por producto", "Rentabilidad por cliente", "Contribución marginal"], nt: "¿Qué línea podría estar subsidiando pérdidas de otra?", os: [{ v: 0, d: "Sin información. Se asume que ventas = ganancia." }, { v: 33, d: "Estimación intuitiva sin datos." }, { v: 66, d: "Margen calculado para líneas con 80% de ventas." }, { v: 100, d: "Rentabilidad granular por producto, cliente y canal." }] },
    { id: "c3", sb: "Control de gastos", q: "¿Existe un proceso formal de aprobación y seguimiento de gastos?", dt: "Verificar límites por área, proceso de aprobación y reporte de desvíos.", ev: ["Presupuesto de gastos", "Órdenes de compra", "Reporte de desvíos"], nt: "¿Cómo se aprueba una compra importante?", os: [{ v: 0, d: "Sin presupuesto ni proceso de aprobación." }, { v: 33, d: "Aprobación informal sin límites formales." }, { v: 66, d: "Presupuesto por área con aprobaciones documentadas." }, { v: 100, d: "Control preventivo con alertas antes de superar límites." }] },
    { id: "c4", sb: "Eficiencia y ahorro", q: "¿Hay iniciativas activas para eliminar costos innecesarios?", dt: "Verificar revisiones de proveedores o renegociaciones en los últimos 12 meses.", ev: ["Registro de ahorros", "Contratos renegociados", "Comparativo año anterior"], nt: "¿Cuándo fue la última vez que revisaron si un gasto recurrente sigue siendo necesario?", os: [{ v: 0, d: "Sin iniciativas. Costos crecen sin análisis." }, { v: 33, d: "Revisión reactiva solo cuando hay problemas." }, { v: 66, d: "Revisión anual formal con ahorros documentados." }, { v: 100, d: "Cultura de eficiencia continua con benchmarks." }] },
  ]},
  { id: "o", lb: "Operaciones", cl: "#059669", ss: [
    { id: "o1", sb: "Sistemas financieros", q: "¿La empresa tiene herramientas adecuadas para gestionar su información financiera?", dt: "Identificar todos los sistemas usados. Evaluar integración y adecuación.", ev: ["Inventario de sistemas", "Demo del sistema principal", "Permisos de usuarios"], nt: "¿Cuántos sistemas distintos maneja? ¿Hay datos duplicados?", os: [{ v: 0, d: "Solo Excel desconectado sin control de versiones." }, { v: 33, d: "Excel + facturación básica. No integrados." }, { v: 66, d: "Software contable parcialmente integrado." }, { v: 100, d: "Sistema integrado con único origen de datos." }] },
    { id: "o2", sb: "Calidad de datos", q: "¿La información financiera es confiable, completa y consistente?", dt: "Prueba cruzada: tomar ventas del último mes y verificar en 3 fuentes distintas.", ev: ["Cruce de registros", "Ventas vs extracto bancario", "Último cierre contable"], nt: "¿Con qué frecuencia aparecen errores?", os: [{ v: 0, d: "Datos inconsistentes. Ningún número confiable." }, { v: 33, d: "Errores frecuentes que requieren validación." }, { v: 66, d: "Datos confiables con validación en cierre mensual." }, { v: 100, d: "Fuente única de datos con validaciones automáticas." }] },
    { id: "o3", sb: "Automatización", q: "¿Los procesos financieros repetitivos están automatizados?", dt: "Mapear los 5 procesos que más horas consumen. Estimar horas manuales por mes.", ev: ["Descripción de procesos", "Estimación de horas por tarea", "Registro de reprocesos"], nt: "¿Cuántas horas mensuales se dedican a carga y control manual?", os: [{ v: 0, d: "Todo manual. Alta dependencia de personas." }, { v: 33, d: "Algunas macros en Excel. Ad hoc." }, { v: 66, d: "Procesos clave automatizados." }, { v: 100, d: "Automatización end-to-end. Equipo focaliza en análisis." }] },
    { id: "o4", sb: "Capacidades del equipo", q: "¿El equipo financiero tiene las competencias adecuadas?", dt: "Evaluar perfil, formación y experiencia. Identificar riesgo de dependencia.", ev: ["Organigrama del área", "Perfil del responsable financiero", "Descripción de puesto"], nt: "¿Qué pasaría si esta persona renuncia mañana?", os: [{ v: 0, d: "Sin perfil financiero. Finanzas las lleva el dueño." }, { v: 33, d: "Perfil básico insuficiente para la complejidad actual." }, { v: 66, d: "Responsable calificado con soporte externo." }, { v: 100, d: "Equipo completo. Sin dependencia crítica." }] },
  ]},
  { id: "f", lb: "Financiamiento", cl: "#dc2626", ss: [
    { id: "f1", sb: "Estructura de deuda", q: "¿La empresa conoce y gestiona su nivel de endeudamiento y costo financiero?", dt: "Solicitar detalle completo de deudas. Calcular ratio deuda/patrimonio.", ev: ["Detalle de pasivos financieros", "Contratos de deuda vigentes", "Cronograma de vencimientos"], nt: "¿Cuál es la tasa promedio de la deuda? ¿Supera la rentabilidad operativa?", os: [{ v: 0, d: "Sin registro claro. Costo real desconocido." }, { v: 33, d: "Conoce deudas pero no monitorea costo consolidado." }, { v: 66, d: "Registro completo con cronograma y costo promedio." }, { v: 100, d: "Gestión activa: renegociación periódica y optimización." }] },
    { id: "f2", sb: "Acceso a financiamiento", q: "¿La empresa tiene acceso a financiamiento formal y diversificado?", dt: "Mapear fuentes actuales y potenciales: bancos, SGR, factoring, leasing.", ev: ["Líneas de crédito disponibles", "Historial de financiamientos", "Calificación crediticia"], nt: "¿Con cuántos bancos opera? ¿Usa instrumentos alternativos?", os: [{ v: 0, d: "Sin crédito formal. Financiamiento informal." }, { v: 33, d: "Una entidad bancaria con condiciones poco competitivas." }, { v: 66, d: "2+ bancos en condiciones de mercado." }, { v: 100, d: "Portfolio diversificado. Condiciones preferenciales." }] },
    { id: "f3", sb: "Evaluación de inversiones", q: "¿Las decisiones de inversión se toman con metodología formal de retorno?", dt: "Verificar si se calcula payback, TIR o VAN para inversiones relevantes.", ev: ["Análisis de inversiones recientes", "Modelo de evaluación utilizado", "Actas de aprobación"], nt: "¿Cuál fue la última inversión importante? ¿Se midió el resultado después?", os: [{ v: 0, d: "Sin metodología. Inversiones por intuición." }, { v: 33, d: "Estimaciones informales de recupero." }, { v: 66, d: "Cálculo de payback y retorno para inversiones relevantes." }, { v: 100, d: "TIR/VAN con seguimiento post-inversión." }] },
  ]},
];

const TOTAL_A = DA.reduce((s, d) => s + d.ss.length, 0);
const LV = ["Sin desarrollo", "En desarrollo", "Maduro", "Optimizado"];

function getRec(d, s) { return (RECS[d] || []).find(r => s <= r.ms) || null; }

function lvl(s) {
  if (s === null || s === undefined) return { label: "—", c: "#9ca3af" };
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
    if (idx + 1 >= qs.length) {
  setPh("r");
  // Enviar respuestas a la API
  const dimScores = {};
  const allAns = { ...ans, [q.id]: sel };
  const sc = {}, cn = {};
  qs.forEach(({ id, d }) => {
    const a = allAns[id];
    if (!d || !a || typeof a.v !== 'number') return;
    sc[d] = (sc[d] || 0) + a.v;
    cn[d] = (cn[d] || 0) + 1;
  });
  const dims = {};
  Object.keys(sc).forEach(d => { dims[d] = Math.round(sc[d] / cn[d]); });
  const imfTotal = Object.keys(dims).length
    ? Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / Object.keys(dims).length)
    : 0;

  fetch('/api/generar-informe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'cliente',
      empresa: co,
      sector: allAns?.sec?.l || '',
      analista: '',
      imf_total: imfTotal,
      dimensiones: {
        gobernanza: dims.est || 0,
        planificacion: dims.pla || 0,
        tesoreria: dims.tes || 0,
        costos: dims.cos || 0,
        operaciones: dims.ope || 0,
        financiamiento: dims.fin || 0
      },
      respuestas: allAns
    })
  }).catch(err => console.error('Error enviando informe:', err));
}
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
      {recs.length > 0 && (<div style={{ textAlign: "center", padding: "2rem 1rem" }}>
  <p style={{ fontSize: 22, fontWeight: 500, margin: "0 0 12px", color: "#111" }}>Gracias por completar el diagnóstico.</p>
  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: 0 }}>Sus respuestas fueron registradas. En los próximos días el equipo de Austral Financial Consulting estará en contacto con los resultados de su informe de madurez financiera.</p>
</div>
      )}
    </div>
  );
}

function AnalistaLogin({ onAcceso }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function check() {
    if (pw === PASS) { onAcceso(); }
    else { setErr(true); setPw(""); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f8" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: "2rem" }}>
        <div style={{ borderLeft: "3px solid #dc2626", paddingLeft: "1rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".08em" }}>Austral Financial Consulting</p>
          <p style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Acceso analista</p>
          <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Uso interno exclusivo</p>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Contraseña</label>
          <input type="password" placeholder="Ingresá la contraseña" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }} onKeyDown={e => e.key === "Enter" && check()} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: err ? "1px solid #ef4444" : "1px solid #e5e7eb", outline: "none" }} />
          {err && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444" }}>Contraseña incorrecta</p>}
        </div>
        <button onClick={check} style={{ width: "100%", padding: "12px", fontSize: 15, borderRadius: 8, cursor: "pointer", background: "#dc2626", color: "#fff", border: "none", fontWeight: 500 }}>Ingresar →</button>
      </div>
    </div>
  );
}

function AnalistaForm({ onVolver }) {
  const [di, setDi] = useState(0);
  const [si, setSi] = useState(0);
  const [sc, setSc] = useState({});
  const [nt, setNt] = useState({});
  const [ev, setEv] = useState({});
  const [sel, setSel] = useState(null);
  const [ph, setPh] = useState("q");
  const [inf, setInf] = useState({ emp: "", ana: "" });

  const dim = DA[di], sub = dim?.ss[si], qk = sub?.id;
  const curSc = sel !== null ? sel : (sc[qk] !== undefined ? sc[qk] : null);
  const ans = Object.keys(sc).length;
  const pct = Math.round((ans / TOTAL_A) * 100);
  const qNum = DA.slice(0, di).reduce((s, d) => s + d.ss.length, 0) + si + 1;

  const dsc = useMemo(() => DA.map(d => {
    const vs = d.ss.map(s => sc[s.id]).filter(v => v !== undefined);
    return { id: d.id, s: vs.length ? Math.round(vs.reduce((a, b) => a + b, 0) / vs.length) : null, a: vs.length, t: d.ss.length };
  }), [sc]);

  const imf = useMemo(() => {
    const vs = dsc.map(d => d.s).filter(v => v !== null);
    return vs.length ? Math.round(vs.reduce((a, b) => a + b, 0) / vs.length) : null;
  }, [dsc]);

  function go(dir) {
    if (sel !== null && qk) setSc(x => ({ ...x, [qk]: sel }));
    setSel(null);
    if (dir === "n") {
      if (si + 1 < dim.ss.length) setSi(i => i + 1);
      else if (di + 1 < DA.length) { setDi(i => i + 1); setSi(0); }
      else setPh("sum");
    } else {
      if (si > 0) setSi(i => i - 1);
      else if (di > 0) { setDi(i => i - 1); setSi(DA[di - 1].ss.length - 1); }
    }
  }

  function jmp(dii, sii) {
    if (sel !== null && qk) setSc(x => ({ ...x, [qk]: sel }));
    setSel(null); setDi(dii); setSi(sii); setPh("q");
  }

  const S = { maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem", fontFamily: "system-ui, sans-serif" };

  if (ph === "info") return (
    <div style={S}>
      <button onClick={onVolver} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#888", marginBottom: "1.5rem", padding: 0 }}>← Volver</button>
      <div style={{ borderLeft: "3px solid #dc2626", paddingLeft: "1rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".08em" }}>Austral Financial Consulting · Uso interno</p>
        <p style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Cuestionario avanzado de madurez financiera</p>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>{TOTAL_A} preguntas · 6 dimensiones · ~90 min</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
        {[["emp", "Empresa cliente", "Nombre de la empresa"], ["ana", "Analista responsable", "Nombre del analista"]].map(([k, lb, ph2]) => (
          <div key={k}>
            <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 5 }}>{lb}</label>
            <input type="text" placeholder={ph2} value={inf[k]} onChange={e => setInf(x => ({ ...x, [k]: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", fontSize: 13, borderRadius: 8, border: "1px solid #e5e7eb", outline: "none" }} />
          </div>
        ))}
      </div>
      <button onClick={() => setPh("q")} style={{ width: "100%", padding: "12px", fontSize: 15, borderRadius: 8, cursor: "pointer", background: "#dc2626", color: "#fff", border: "none", fontWeight: 500 }}>Iniciar cuestionario →</button>
    </div>
  );

  if (ph === "q" && sub) {
    const curEv = ev[qk] || {};
    const isFirst = di === 0 && si === 0;
    const isLast = di === DA.length - 1 && si === dim.ss.length - 1;
    return (
      <div style={S}>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4, marginBottom: "1rem" }}>
          {DA.map((d, dii) => {
            const ds = dsc.find(x => x.id === d.id);
            const act = dii === di;
            return (
              <button key={d.id} onClick={() => jmp(dii, 0)} style={{ padding: "6px 11px", borderRadius: 7, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, background: act ? d.cl + "15" : "#f3f4f6", border: act ? "2px solid " + d.cl : "1px solid #e5e7eb", color: act ? d.cl : "#666", fontWeight: act ? 500 : 400 }}>
                {d.lb}{ds?.s !== null && ds?.s !== undefined ? <span style={{ marginLeft: 5, fontSize: 11 }}>{ds.s}</span> : ""}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 11, background: dim.cl + "18", color: dim.cl, padding: "3px 9px", borderRadius: 6, fontWeight: 500 }}>{sub.sb}</span>
          <span style={{ fontSize: 12, color: "#888" }}>P{qNum}/{TOTAL_A} · {pct}% completado</span>
        </div>
        <div style={{ background: "#e5e7eb", borderRadius: 3, height: 3, marginBottom: "1.25rem" }}>
          <div style={{ background: dim.cl, borderRadius: 3, height: 3, width: pct + "%", transition: "width .3s" }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, marginBottom: "0.75rem" }}>{sub.q}</p>
        <div style={{ background: "#f9f9f8", borderRadius: 8, padding: "10px 13px", marginBottom: "1rem", border: "1px solid #e5e7eb" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: "#666" }}>Qué buscar y verificar</p>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666", lineHeight: 1.55 }}>{sub.dt}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {sub.ev.map((ev2, i) => {
              const chk = curEv[i];
              return (
                <button key={i} onClick={() => setEv(x => ({ ...x, [qk]: { ...curEv, [i]: !chk } }))} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, fontSize: 11, border: "1px solid " + (chk ? "#059669" : "#e5e7eb"), background: chk ? "#ecfdf5" : "#fff", color: chk ? "#059669" : "#666", cursor: "pointer" }}>
                  <span style={{ fontSize: 10 }}>{chk ? "✓" : "○"}</span>{ev2}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1rem" }}>
          {sub.os.map((opt, i) => {
            const isSel = curSc === opt.v;
            return (
              <button key={i} onClick={() => setSel(opt.v)} style={{ textAlign: "left", padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12.5, lineHeight: 1.45, display: "flex", alignItems: "flex-start", gap: 8, width: "100%", border: isSel ? "2px solid " + dim.cl : "1px solid #e5e7eb", background: isSel ? dim.cl + "10" : "#fff" }}>
                <div style={{ minWidth: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: isSel ? dim.cl : "#888" }}>{opt.v}</span>
                  <span style={{ fontSize: 9, color: "#aaa" }}>{LV[i].split(" ")[0]}</span>
                </div>
                <div>
                  <p style={{ margin: "0 0 1px", fontSize: 12, fontWeight: isSel ? 500 : 400, color: isSel ? dim.cl : "#111" }}>{LV[i]}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.45 }}>{opt.d}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>{sub.nt}</label>
          <textarea placeholder="Observaciones concretas: montos, fechas, nombres, inconsistencias." value={nt[qk] || ""} onChange={e => setNt(x => ({ ...x, [qk]: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 52, fontSize: 12, padding: "7px 10px", borderRadius: 7, lineHeight: 1.5, border: "1px solid #e5e7eb", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isFirst && <button onClick={() => go("p")} style={{ padding: "9px 15px", fontSize: 13, color: "#888", background: "none", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}>← Anterior</button>}
          <div style={{ flex: 1 }} />
          <button onClick={() => go("n")} style={{ padding: "10px 22px", fontSize: 14, borderRadius: 8, opacity: curSc !== null ? 1 : 0.35, cursor: curSc !== null ? "pointer" : "not-allowed", background: dim.cl, color: "#fff", border: "none", fontWeight: 500 }}>
            {isLast ? "Ver resumen →" : "Siguiente →"}
          </button>
        </div>
      </div>
    );
  }

  if (ph === "sum") {
    const lvi = lvl(imf);
    const sorted = [...dsc].sort((a, b) => (a.s ?? 999) - (b.s ?? 999));
    const dm = Object.fromEntries(DA.map(d => [d.id, d]));
    return (
      <div style={S}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".08em" }}>{inf.emp || "Cliente"} · {inf.ana || "Analista"}</p>
          <p style={{ fontSize: 18, fontWeight: 500, margin: "0 0 1.25rem" }}>Resultado: Índice de Madurez Financiera</p>
          {imf !== null && (
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "1.25rem 3rem", border: "1px solid #e5e7eb", borderRadius: 14, background: "#f9f9f8" }}>
              <span style={{ fontSize: 46, fontWeight: 500, color: lvi.c, lineHeight: 1 }}>{imf}</span>
              <span style={{ fontSize: 12, color: "#888" }}>/100 · {ans}/{TOTAL_A} preguntas respondidas</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: lvi.c }}>{lvi.label}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
          {sorted.map(ds => {
            const meta = dm[ds.id];
            const lvis = lvl(ds.s);
            return (
              <div key={ds.id} style={{ background: "#f9f9f8", borderRadius: 10, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{meta.lb}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: lvis.c }}>{ds.s !== null ? ds.s + " · " + lvis.label : "Sin datos"}</span>
                </div>
                {ds.s !== null && <div style={{ background: "#e5e7eb", borderRadius: 4, height: 5, marginBottom: 10 }}><div style={{ background: lvis.c, borderRadius: 4, height: 5, width: ds.s + "%" }} /></div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {DA.find(d => d.id === ds.id).ss.map((s, sii) => {
                    const sv = sc[s.id];
                    const lvsub = lvl(sv !== undefined ? sv : null);
                    return (
                      <div key={s.id} onClick={() => jmp(DA.findIndex(d => d.id === ds.id), sii)} style={{ background: "#fff", borderRadius: 7, padding: "7px 9px", border: "1px solid #e5e7eb", cursor: "pointer" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 500 }}>{s.sb}</p>
                        <span style={{ fontSize: 11, color: lvsub.c }}>{sv !== undefined ? sv + " · " + lvsub.label : "Sin responder"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setPh("q"); setDi(0); setSi(0); }} style={{ flex: 1, padding: "10px", fontSize: 14, borderRadius: 8, cursor: "pointer", border: "1px solid #e5e7eb", background: "#fff" }}>Revisar respuestas</button>
          <button onClick={onVolver} style={{ flex: 1, padding: "10px", fontSize: 14, borderRadius: 8, cursor: "pointer", background: "#dc2626", color: "#fff", border: "none", fontWeight: 500 }}>Finalizar</button>
        </div>
      </div>
    );
  }
  return null;
}

function App() {
  const [vista, setVista] = useState("home");
  const [analistaOk, setAnalistaOk] = useState(false);

  if (vista === "cliente") return <ClienteForm onVolver={() => setVista("home")} />;
  if (vista === "analista") {
    if (!analistaOk) return <AnalistaLogin onAcceso={() => setAnalistaOk(true)} />;
    return <AnalistaForm onVolver={() => { setVista("home"); setAnalistaOk(false); }} />;
  }

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
          <button onClick={() => setVista("analista")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderRadius: 12, cursor: "pointer", textAlign: "left", border: "1.5px solid #dc262633", background: "#fff", color: "#111" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 500 }}>Soy analista</p>
              <p style={{ margin: 0, fontSize: 13, opacity: .8 }}>Relevamiento avanzado</p>
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
