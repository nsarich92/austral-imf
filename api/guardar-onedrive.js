export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { empresa, informe_texto, imf_total, tipo, fecha } = req.body;

  if (!informe_texto) {
    return res.status(400).json({ error: 'Falta el contenido del informe' });
  }

  try {
    // 1. Obtener token de Azure
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.AZURE_CLIENT_ID,
          client_secret: process.env.AZURE_CLIENT_SECRET,
          scope: 'https://graph.microsoft.com/.default'
        })
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('No se pudo obtener token de Azure: ' + JSON.stringify(tokenData));
    }

    // 2. Obtener el drive del usuario
    const driveResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${process.env.ONEDRIVE_USER_EMAIL}/drive`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    const driveData = await driveResponse.json();
    const driveId = driveData.id;

    // 3. Construir nombre de archivo y carpeta
    const fechaStr = fecha || new Date().toISOString().slice(0, 10);
    const empresaLimpia = (empresa || 'Sin-nombre').replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, '').trim();
    const tipoStr = tipo === 'cliente' ? 'Diagnóstico-Inicial' : 'Diagnóstico-Avanzado';
    const nombreArchivo = `${fechaStr}_${empresaLimpia}_${tipoStr}_IMF${imf_total}.txt`;

    // 4. Ruta en OneDrive
    // Austral Consulting/Clientes/Diagnósticos IMF Austral/{empresa}/
    const rutaBase = 'Austral Consulting/Clientes/Diagnósticos IMF Austral';
    const rutaCompleta = `${rutaBase}/${empresaLimpia}`;

    // 5. Crear carpeta del cliente si no existe
    await fetch(
      `https://graph.microsoft.com/v1.0/users/${process.env.ONEDRIVE_USER_EMAIL}/drive/root:/${rutaBase}:/children`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: empresaLimpia,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        })
      }
    );

    // 6. Subir el archivo de texto con el informe
    const uploadResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${process.env.ONEDRIVE_USER_EMAIL}/drive/root:/${rutaCompleta}/${nombreArchivo}:/content`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/plain; charset=utf-8'
        },
        body: informe_texto
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadData.id) {
      throw new Error('Error subiendo archivo: ' + JSON.stringify(uploadData));
    }

    return res.status(200).json({
      success: true,
      archivo: nombreArchivo,
      url: uploadData.webUrl,
      message: 'Informe guardado en OneDrive correctamente'
    });

  } catch (error) {
    console.error('Error guardando en OneDrive:', error);
    return res.status(500).json({ error: 'Error guardando en OneDrive', details: error.message });
  }
}