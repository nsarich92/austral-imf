const SKILL = `Eres el redactor de informes de Austral Financial Consulting. Redactá un informe de diagnóstico de madurez financiera profesional.

TONO: consultor senior Big Four, profesional y directo, sin exceso de formalidad, para gerentes sin perfil técnico financiero.
LÓGICA: Explicar para cada dimensión la situación actual y que riesgos implica estar en esa situación, los cambios a introducir para lograr la situación deseada y que fortalezas generaría para el negocio.
REGLAS: párrafos cortos/medianos, voz activa, sin muletillas, lenguaje de negocio simple. Utilizar conectores para que la lectura sea amena. En los títulos y subtítulos usar solo una mayúscula en la primera letra, ejemplo "Resultados del primer trimestre" y no "Resultados del Primer Trimestre".
ESCALA IMF: 0-25 Sin desarrollar / 26-50 En desarrollo / 51-75 Maduro / 76-100 Optimizado

ESTRUCTURA:
# DIAGNÓSTICO DE MADUREZ FINANCIERA
## [Nombre empresa] | [Fecha]
CONFIDENCIAL — USO EXCLUSIVO DE AUSTRAL FINANCIAL CONSULTING

## INTRODUCCIÓN
[2 párrafos sobre propósito y metodología]

## RESUMEN EJECUTIVO
IMF Total: [XX]/100 — [Nivel]
[Síntesis, dimensiones críticas, 3 acciones inmediatas]

## RESULTADOS POR DIMENSIÓN
Para cada dimensión: situación actual y riesgos, situación deseada y fortalezas, 3 acciones con horizonte.

## TABLA RESUMEN IMF
[Tabla con las 6 dimensiones y el IMF total]

## CONCLUSIONES
[Síntesis, perspectiva, próximos pasos]

## ANEXO — RESPUESTAS DEL CUESTIONARIO
[Tabla con preguntas, respuestas y puntajes por dimensión]`;

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
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: empresaLimpia,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename"
      })
    }
  );

  const uploadResponse = await fetch(
    "https://graph.microsoft.com/v1.0/users/" + userEmail + "/drive/root:/" + rutaCompleta + "/" + nombreArchivo + ":/content",
    {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "text/plain; charset=utf-8"
      },
      body: contenido
    }
  );

  const uploadData = await uploadResponse.json();
  console.log("OneDrive TXT upload:", JSON.stringify(uploadData).slice(0, 200));
  return uploadData;
}

async function savePdfToOneDrive(token, userEmail, empresa, pdfBytes, tipo, imfTotal) {
  const fechaStr = new Date().toISOString().slice(0, 10);
  const empresaLimpia = (empresa || "Sin-nombre").replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  const tipoStr = tipo === "cliente" ? "Diagnostico-Inicial" : "Diagnostico-Avanzado";
  const nombrePdf = fechaStr + "_" + empresaLimpia + "_" + tipoStr + "_IMF" + imfTotal + ".pdf";
  const rutaCompleta = "Austral Consulting/Clientes/Diagnosticos IMF Austral/" + empresaLimpia;

  const uploadResponse = await fetch(
    "https://graph.microsoft.com/v1.0/users/" + userEmail + "/drive/root:/" + rutaCompleta + "/" + nombrePdf + ":/content",
    {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/pdf"
      },
      body: pdfBytes
    }
  );

  const uploadData = await uploadResponse.json();
  console.log("OneDrive PDF upload:", JSON.stringify(uploadData).slice(0, 200));
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
    // 1. Generar informe con Claude
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
          content: "Redactá el informe completo para:\n" +
            "Empresa: " + (empresa || "No informado") + "\n" +
            "Sector: " + (sector || "No informado") + "\n" +
            "Tipo: " + (tipo === "cliente" ? "Diagnóstico inicial" : "Diagnóstico avanzado") + "\n" +
            "Analista: " + (analista || "No informado") + "\n" +
            "Fecha: " + new Date().toLocaleDateString("es-AR") + "\n\n" +
            "PUNTAJES:\n" +
            "IMF Total: " + imf_total + "/100\n" +
            "Estrategia y Gobernanza: " + (dimensiones && dimensiones.gobernanza || 0) + "/100\n" +
            "Planificación y Análisis: " + (dimensiones && dimensiones.planificacion || 0) + "/100\n" +
            "Tesorería y Liquidez: " + (dimensiones && dimensiones.tesoreria || 0) + "/100\n" +
            "Costos y Rentabilidad: " + (dimensiones && dimensiones.costos || 0) + "/100\n" +
            "Operaciones y Tecnología: " + (dimensiones && dimensiones.operaciones || 0) + "/100\n" +
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

    // 2. Guardar en Supabase
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

    // 3. Obtener token Azure
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

    // 4. Guardar TXT en OneDrive
    if (azureToken) {
      try {
        await saveToOneDrive(azureToken, process.env.ONEDRIVE_USER_EMAIL, empresa, informeTexto, tipo, imf_total);
      } catch (txtError) {
        console.error("OneDrive TXT error:", txtError.message);
      }
    }

    // 5. Generar PDF y guardar en OneDrive
    if (azureToken) {
      try {
        const pdfResponse = await fetch("https://austral-imf.vercel.app/api/generar-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            informe_texto: informeTexto,
            empresa: empresa,
            imf_total: imf_total,
            tipo: tipo,
            fecha: new Date().toLocaleDateString("es-AR")
          })
        });

        if (pdfResponse.ok) {
          const pdfBuffer = await pdfResponse.arrayBuffer();
          const pdfBytes = Buffer.from(pdfBuffer);
          await savePdfToOneDrive(azureToken, process.env.ONEDRIVE_USER_EMAIL, empresa, pdfBytes, tipo, imf_total);
          console.log("PDF generado y guardado en OneDrive");
        } else {
          console.error("PDF response error:", pdfResponse.status);
        }
      } catch (pdfError) {
        console.error("PDF error:", pdfError.message);
      }
    }

    // 6. Enviar notificación por email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: "noreply@consultingaustral.com",
        to: "nsarich@consultingaustral.com",
        subject: "Nuevo diagnóstico IMF — " + (empresa || "Empresa sin nombre") + " (" + imf_total + "/100)",
        html: "<div style='font-family:sans-serif;max-width:500px'><h2 style='color:#212536'>Nuevo diagnóstico completado</h2><p><b>Empresa:</b> " + (empresa || "No informado") + "</p><p><b>Sector:</b> " + (sector || "No informado") + "</p><p><b>Tipo:</b> " + (tipo === "cliente" ? "Diagnóstico inicial" : "Diagnóstico avanzado") + "</p><p><b>IMF Total:</b> " + imf_total + "/100</p><p><b>Fecha:</b> " + new Date().toLocaleDateString("es-AR") + "</p></div>"
      })
    });

    return res.status(200).json({ success: true, diagnosticoId: diagnosticoId });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};