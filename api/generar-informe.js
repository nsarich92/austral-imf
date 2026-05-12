const SKILL = `Eres el redactor de informes de Austral Financial Consulting. Redacta un informe de diagnostico de madurez financiera profesional.

TONO: consultor senior Big Four, profesional y directo, para gerentes sin perfil tecnico financiero.
LOGICA: Para cada dimension explicar situacion actual y riesgos, cambios para lograr la situacion deseada y fortalezas que generaria.
REGLAS: parrafos cortos, voz activa, sin muletillas, lenguaje de negocio simple.
ESCALA IMF: 0-25 Sin desarrollar / 26-50 En desarrollo / 51-75 Maduro / 76-100 Optimizado

ESTRUCTURA:
# DIAGNOSTICO DE MADUREZ FINANCIERA
## [Nombre empresa] | [Fecha]
CONFIDENCIAL - USO EXCLUSIVO DE AUSTRAL FINANCIAL CONSULTING

## INTRODUCCION
[2 parrafos sobre proposito y metodologia]

## RESUMEN EJECUTIVO
IMF Total: [XX]/100 - [Nivel]
[Sintesis, dimensiones criticas, 3 acciones inmediatas]

## RESULTADOS POR DIMENSION
Para cada dimension: situacion actual y riesgos, situacion deseada y fortalezas, 3 acciones con horizonte.

## TABLA RESUMEN IMF
[Tabla con las 6 dimensiones y el IMF total]

## CONCLUSIONES
[Sintesis, perspectiva, proximos pasos]

## ANEXO - RESPUESTAS DEL CUESTIONARIO
[Tabla con preguntas, respuestas y puntajes por dimension]`;

async function getAzureToken(tenantId, clientId, clientSecret) {
  const response = await fetch(
    "https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default"
      })
    }
  );
  const data = await response.json();
  return data.access_token;
}

async function saveToOneDrive(token, userEmail, empresa, contenido, tipo, imfTotal) {
  const fechaStr = new Date().toISOString().slice(0, 10);
  const empresaLimpia = (empresa || "Sin-nombre").replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  const tipoStr = tipo === "cliente" ? "Diagnostico-Inicial" : "Diagnostico-Avanzado";
  const nombreArchivo = fechaStr + "_" + empresaLimpia + "_" + tipoStr + "_IMF" + imfTotal + ".txt";
  const rutaBase = "Austral Consulting/Clientes/Diagnosticos IMF Austral";
  const rutaCompleta = rutaBase + "/" + empresaLimpia;

  await fetch(
    "https://graph.microsoft.com/v1.0/users/" + userEmail + "/drive/root:/" + rutaBase + ":/children",
    {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ name: empresaLimpia, folder: {}, "@microsoft.graph.conflictBehavior": "rename" })
    }
  );

  const uploadResponse = await fetch(
    "https://graph.microsoft.com/v1.0/users/" + userEmail + "/drive/root:/" + rutaCompleta + "/" + nombreArchivo + ":/content",
    {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "text/plain; charset=utf-8" },
      body: contenido
    }
  );

  const uploadData = await uploadResponse.json();
  console.log("OneDrive upload:", JSON.stringify(uploadData).slice(0, 150));
  return uploadData;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tipo, empresa, sector, analista, imf_total, dimensiones, respuestas } = req.body;

  if (!respuestas) {
    return res.status(400).json({ error: "Faltan datos del cuestionario" });
  }

  try {
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SKILL,
        messages: [{
          role: "user",
          content: "Redacta el informe completo para:\n" +
            "Empresa: " + (empresa || "No informado") + "\n" +
            "Sector: " + (sector || "No informado") + "\n" +
            "Tipo: " + (tipo === "cliente" ? "Diagnostico inicial" : "Diagnostico avanzado") + "\n" +
            "Analista: " + (analista || "No informado") + "\n" +
            "Fecha: " + new Date().toLocaleDateString("es-AR") + "\n\n" +
            "PUNTAJES:\n" +
            "IMF Total: " + imf_total + "/100\n" +
            "Estrategia y Gobernanza: " + (dimensiones && dimensiones.gobernanza || 0) + "/100\n" +
            "Planificacion y Analisis: " + (dimensiones && dimensiones.planificacion || 0) + "/100\n" +
            "Tesoreria y Liquidez: " + (dimensiones && dimensiones.tesoreria || 0) + "/100\n" +
            "Costos y Rentabilidad: " + (dimensiones && dimensiones.costos || 0) + "/100\n" +
            "Operaciones y Tecnologia: " + (dimensiones && dimensiones.operaciones || 0) + "/100\n" +
            "Financiamiento: " + (dimensiones && dimensiones.financiamiento || 0) + "/100\n\n" +
            "RESPUESTAS:\n" + JSON.stringify(respuestas, null, 2)
        }]
      })
    });

    const claudeData = await claudeResponse.json();
    const informeTexto = claudeData.content && claudeData.content[0] && claudeData.content[0].text;

    if (!informeTexto) {
      throw new Error("Claude: " + JSON.stringify(claudeData));
    }

    const supabaseResponse = await fetch(process.env.SUPABASE_URL + "/rest/v1/diagnosticos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_SECRET_KEY,
        "Authorization": "Bearer " + process.env.SUPABASE_SECRET_KEY,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        tipo: tipo,
        empresa: empresa,
        sector: sector,
        analista: analista,
        imf_total: imf_total,
        dim_gobernanza: dimensiones && dimensiones.gobernanza || null,
        dim_planificacion: dimensiones && dimensiones.planificacion || null,
        dim_tesoreria: dimensiones && dimensiones.tesoreria || null,
        dim_costos: dimensiones && dimensiones.costos || null,
        dim_operaciones: dimensiones && dimensiones.operaciones || null,
        dim_financiamiento: dimensiones && dimensiones.financiamiento || null,
        respuestas: respuestas,
        informe_texto: informeTexto,
        informe_status: "generado"
      })
    });

    const supabaseData = await supabaseResponse.json();
    const diagnosticoId = supabaseData && supabaseData[0] && supabaseData[0].id;

    let azureToken = null;
    try {
      azureToken = await getAzureToken(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );
    } catch (tokenError) {
      console.error("Azure token error:", tokenError.message);
    }

    if (azureToken) {
      try {
        await saveToOneDrive(azureToken, process.env.ONEDRIVE_USER_EMAIL, empresa, informeTexto, tipo, imf_total);
      } catch (txtError) {
        console.error("OneDrive error:", txtError.message);
      }
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: "noreply@consultingaustral.com",
        to: "nsarich@consultingaustral.com",
        subject: "Nuevo diagnostico IMF - " + (empresa || "Empresa sin nombre") + " (" + imf_total + "/100)",
        html: "<div style='font-family:sans-serif;max-width:500px'><h2 style='color:#212536'>Nuevo diagnostico completado</h2><p><b>Empresa:</b> " + (empresa || "No informado") + "</p><p><b>Sector:</b> " + (sector || "No informado") + "</p><p><b>Tipo:</b> " + (tipo === "cliente" ? "Diagnostico inicial" : "Diagnostico avanzado") + "</p><p><b>IMF Total:</b> " + imf_total + "/100</p><p><b>Fecha:</b> " + new Date().toLocaleDateString("es-AR") + "</p></div>"
      })
    });

    return res.status(200).json({ success: true, diagnosticoId: diagnosticoId });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};