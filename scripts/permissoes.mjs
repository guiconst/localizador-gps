// Injeta as permissões de localização no AndroidManifest.xml (idempotente).
import fs from 'node:fs';

const caminho = 'android/app/src/main/AndroidManifest.xml';
if (!fs.existsSync(caminho)) {
  console.error('AndroidManifest.xml não encontrado. Rode antes: npx cap add android');
  process.exit(1);
}

let xml = fs.readFileSync(caminho, 'utf8');
const permissoes = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
];

let alterado = false;
for (const p of permissoes) {
  if (!xml.includes(p)) {
    xml = xml.replace('</manifest>', `    <uses-permission android:name="${p}" />\n</manifest>`);
    alterado = true;
  }
}

if (alterado) {
  fs.writeFileSync(caminho, xml);
  console.log('Permissões de localização adicionadas ao AndroidManifest.xml');
} else {
  console.log('Permissões já estavam declaradas.');
}
