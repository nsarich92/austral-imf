// Generar PDF y subir a OneDrive
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
    const fechaStr = new Date().toISOString().slice(0, 10);
    const empresaLimpia = (empresa || "Sin-nombre").replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    const tipoStr = tipo === "cliente" ? "Diagnostico-Inicial" : "Diagnostico-Avanzado";
    const nombrePdf = fechaStr + "_" + empresaLimpia + "_" + tipoStr + "_IMF" + imf_total + ".pdf";
    const rutaCompleta = "Austral Consulting/Clientes/Diagnosticos IMF Austral/" + empresaLimpia;
    const token = await getAzureToken(process.env.AZURE_TENANT_ID, process.env.AZURE_CLIENT_ID, process.env.AZURE_CLIENT_SECRET);
    await fetch("https://graph.microsoft.com/v1.0/users/" + process.env.ONEDRIVE_USER_EMAIL + "/drive/root:/" + rutaCompleta + "/" + nombrePdf + ":/content", {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/pdf" },
      body: pdfBytes
    });
    console.log("PDF guardado en OneDrive: " + nombrePdf);
  }
} catch (pdfError) {
  console.error("PDF error:", pdfError.message);
}