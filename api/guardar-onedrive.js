const SKILL = `
Eres el redactor de informes de Austral Financial Consulting. Tu tarea es redactar un informe de diagnóstico de madurez financiera profesional basado en los datos del cuestionario IMF que recibirás.

IDENTIDAD DE MARCA:
- Nombre: Austral Financial Consulting
- Tono: consultor senior Big Four, directo, sin vueltas, orientado a decisiones
- Audiencia: gerentes generales y dueños de PYMES sin perfil técnico financiero

REGLAS DE REDACCIÓN:
- Párrafos cortos, máximo 4 líneas
- Voz activa siempre
- Sin muletillas: nunca "es importante destacar", "cabe señalar", "en este sentido"
- Lenguaje de negocio: "ventas", "gastos", "ganancia", "caja"
- Los puntajes bajos son oportunidades, no fracasos
- Nunca inventar datos que no estén en el input

ESCALA IMF:
- 0-25: Sin desarrollar — gestión reactiva, riesgo alto
- 26-50: En desarrollo — bases incompletas, oportunidades claras
- 51-75: Maduro — función establecida, optimización posible
- 76-100: Optimizado — finanzas como motor estratégico

ESTRUCTURA DEL INFORME (seguir exactamente):

# DIAGNÓSTICO DE MADUREZ FINANCIERA
## [Nombre empresa]
### [Fecha]
CONFIDENCIAL — USO EXCLUSIVO DE AUSTRAL FINANCIAL CONSULTING

---

## INTRODUCCIÓN
[2 párrafos: propósito del diagnóstico, metodología IMF Austral, 6 dimensiones evaluadas]

---

## RESUMEN EJECUTIVO

**IMF Total: [XX]/100 — [Nivel]**

[Párrafo de síntesis: qué dice el IMF sobre esta empresa en términos prácticos]

**Dimensiones más críticas:**
[Lista de las 3 dimensiones con menor puntaje con una línea de descripción cada una]

**Acciones de mayor impacto inmediato:**
[Lista de 3 acciones concretas]

---

## RESULTADOS POR DIMENSIÓN

### 1. ESTRATEGIA Y GOBERNANZA — [XX]/100 — [Nivel]
**Situación actual:** [1-2 párrafos]
**Situación deseada:** [1 párrafo]
**Acciones recomendadas:**
1. [Acción] — [Responsable] — [Horizonte]
2. [Acción] — [Responsable] — [Horizonte]
3. [Acción] — [Responsable] — [Horizonte]

### 2. PLANIFICACIÓN Y ANÁLISIS — [XX]/100 — [Nivel]
[mismo formato]

### 3. TESORERÍA Y LIQUIDEZ — [XX]/100 — [Nivel]
[mismo formato]

### 4. COSTOS Y RENTABILIDAD — [XX]/100 — [Nivel]
[mismo formato]

### 5. OPERACIONES Y TECNOLOGÍA — [XX]/100 — [Nivel]
[mismo formato]

### 6. FINANCIAMIENTO — [XX]/100 — [Nivel]
[mismo formato]

---

## TABLA RESUMEN IMF

| Dimensión | Puntaje | Nivel |
|-----------|---------|-------|
| Estrategia y Gobernanza | XX | [nivel] |
| Planificación y Análisis | XX | [nivel] |
| Tesorería y Liquidez | XX | [nivel] |
| Costos y Rentabilidad | XX | [nivel] |
| Operaciones y Tecnología | XX | [nivel] |
| Financiamiento | XX | [nivel] |
| **IMF TOTAL** | **XX** | **[nivel]** |

---

## CONCLUSIONES
[3 párrafos: síntesis de hallazgos críticos, perspectiva práctica, próximos pasos con Austral]

---

## ANEXO — RESPUESTAS DEL CUESTIONARIO
[Tabla con todas las preguntas, respuesta seleccionada y puntaje, agrupadas por dimensión]
`;

async function getAzureToken(tenantId, clientId, clientSecret) {
  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default'
      })
    }
  );
  const data = await response.json();
  return data.access_token;
}

async function saveToOneDrive(token, userEmail, empresa, contenido, tipo, imfTotal) {
  const fechaStr = new Date().toISOString().slice(0, 10);
  const empresaLimpia = (empresa || 'Sin-nombre').replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  const tipoStr = tipo === 'cliente' ? 'Diagnostico-Inicial' : 'Diagnostico-Avanzado';
  const nombreArchivo = `${fechaStr}_${empresaLimpia}_${tipoStr}_IMF${imfTotal}.txt`;
  const rutaBase = 'Austral Consulting/Clientes/Diagnosticos IMF Austral';
  const rutaCompleta = `${rutaBase}/${empresaLimpia}`;

  // Crear carpeta del cliente
  await fetch(
    `https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${rutaBase}:/children`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: empresaLimpia,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename'
      })
    }
  );

  // Subir archivo
  const uploadResponse = await fetch(
    `https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${rutaCompleta}/${nombreArchivo}:/content`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: contenido
    }
  );

  const uploadData = await uploadResponse.json();
  console.log('OneDrive upload result:', JSON.stringify(uploadData));
  return uploadData;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tipo, empresa, sector, analista, imf_total, dimensiones, respuestas } = req.body;

  if (!respuestas) {
    return res.status(400).json({ error: 'Faltan datos del cuestionario' });
  }

  try {
    // 1. Generar informe con Claude
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SKILL,
        messages: [{
          role: 'user',
          content: `Redactá el informe de diagnóstico IMF completo para este cliente:

DATOS DEL CLIENTE:
- Empresa: ${empresa || 'No informado'}
- Sector: ${sector || 'No informado'}
- Tipo de cuestionario: ${tipo === 'cliente' ? 'Diagnóstico inicial (cliente)' : 'Diagnóstico avanzado (analista)'}
- Analista: ${analista || 'No informado'}
- Fecha: ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}

PUNTAJES IMF:
- IMF Total: ${imf_total}/100
- Estrategia y Gobernanza: ${dimensiones?.gobernanza || 0}/100
- Planificación y Análisis: ${dimensiones?.planificacion || 0}/100
- Tesorería y Liquidez: ${dimensiones?.tesoreria || 0}/100
- Costos y Rentabilidad: ${dimensiones?.costos || 0}/100
- Operaciones y Tecnología: ${dimensiones?.operaciones || 0}/100
- Financiamiento: ${dimensiones?.financiamiento || 0}/100

RESPUESTAS DEL CUESTIONARIO:
${JSON.stringify(respuestas, null, 2)}

Redactá el informe completo siguiendo la estructura indicada.`
        }]
      })
    });

    const claudeData = await claudeResponse.json();
    const informeTexto = claudeData.content?.[0]?.text;

    if (!informeTexto) {
      throw new Error('Claude respuesta: ' + JSON.stringify(claudeData));
    }

    // 2. Guardar en Supabase
    const supabaseResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/diagnosticos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        tipo,
        empresa,
        sector,
        analista,
        imf_total,
        dim_gobernanza: dimensiones?.gobernanza || null,
        dim_planificacion: dimensiones?.planificacion || null,
        dim_tesoreria: dimensiones?.tesoreria || null,
        dim_costos: dimensiones?.costos || null,
        dim_operaciones: dimensiones?.operaciones || null,
        dim_financiamiento: dimensiones?.financiamiento || null,
        respuestas,
        informe_texto: informeTexto,
        informe_status: 'generado'
      })
    });

    const supabaseData = await supabaseResponse.json();
    const diagnosticoId = supabaseData?.[0]?.id;

    // 3. Guardar en OneDrive
    try {
      const token = await getAzureToken(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );
      await saveToOneDrive(token, process.env.ONEDRIVE_USER_EMAIL, empresa, informeTexto, tipo, imf_total);
      console.log('OneDrive: guardado correctamente');
    } catch (onedriveError) {
      console.error('OneDrive error:', onedriveError.message);
    }

    // 4. Enviar notificación por email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'noreply@consultingaustral.com',
        to: 'nsarich@consultingaustral.com',
        subject: `Nuevo diagnóstico IMF — ${empresa || 'Empresa sin nombre'} (${imf_total}/100)`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #212536;">Nuevo diagnóstico completado</h2>
            <p><strong>Empresa:</strong> ${empresa || 'No informado'}</p>
            <p><strong>Sector:</strong> ${sector || 'No informado'}</p>
            <p><strong>Tipo:</strong> ${tipo === 'cliente' ? 'Diagnóstico inicial' : 'Diagnóstico avanzado'}</p>
            <p><strong>IMF Total:</strong> ${imf_total}/100</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
            <hr style="border-color: #B9B9B9;" />
            <p style="color: #B9B9B9; font-size: 12px;">ID: ${diagnosticoId || 'N/A'}</p>
          </div>
        `
      })
    });

    return res.status(200).json({
      success: true,
      diagnosticoId,
      message: 'Informe generado y guardado correctamente'
    });

  } catch (error) {
    console.error('Error generando informe:', error);
    return res.status(500).json({ error: 'Error generando el informe', details: error.message });
  }
}