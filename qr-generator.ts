import QRCode from 'qrcode'
import { join } from 'path'

export async function generateQR() {
  // 1. version console
  console.log(await QRCode.toString('https://na-innovations.com', { type: 'terminal' }))

  // 2. version base64 (utile si tu veux le renvoyer via API)
  const base64 = await QRCode.toDataURL('https://na-innovations.com')
  console.log(base64)

  // 3. version fichier PNG (sauvegardé dans /src ou /tmp)
  const outputPath = join(process.cwd(), 'qrcode.png')
  await QRCode.toFile(outputPath, 'https://na-innovations.com', {
    color: { dark: '#000000', light: '#FFFFFF' },
  })
  console.log('✅ QR Code saved at', outputPath)
}

// Pour tester directement :
generateQR()
