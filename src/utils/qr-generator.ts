import QRCode from 'qrcode'

async function generateQR() {
  const url = 'https://rwdmacademy.be'

  // 1️⃣ Affiche une version textuelle dans le terminal
  console.log(await QRCode.toString(url, { type: 'terminal' }))

  // 2️⃣ Génère la version image (base64)
  const base64 = await QRCode.toDataURL(url)
  console.log('\nBase64 preview:', base64.slice(0, 80) + '...')

  // 3️⃣ Sauvegarde le fichier PNG dans ton projet
  await QRCode.toFile('qrcode.png', url, {
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  console.log('\n✅ QR Code generated successfully: qrcode.png')
}

generateQR().catch(console.error)
