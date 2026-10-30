# Localizador GPS — Aula 14 (Programação para Dispositivos Móveis II)

React + Vite + Capacitor + `@capacitor/geolocation`.

## Rodar no navegador (teste rápido)
```bash
npm install
npm run dev
```
No navegador o GPS usa a localização do computador.

## Rodar no celular Android (com Android Studio)
```bash
npm install
npm run build
npm run android:add     # cria a pasta android/, injeta as permissões e sincroniza
npx cap run android     # ou: npx cap open android
```
Depois de mudar o código: `npm run android:sync`.

## Sem Android Studio: gerar o APK pelo GitHub
1. Suba este projeto num repositório do GitHub (branch `main`).
2. Aba **Actions** > **Build APK** > baixe o artefato `localizador-gps-apk`.
3. Instale o `app-debug.apk` no celular.

## Permissões (AndroidManifest.xml)
O script `scripts/permissoes.mjs` adiciona dentro de `<manifest>`:
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## Adaptar à carta do seu número de chamada
Edite `src/tema.js` (título, texto, limite do histórico, precisão aceitável)
e a lógica em `src/App.jsx`.

## Prints para entregar
1. Modal do Android pedindo permissão de localização
2. Latitude, longitude e precisão na tela
3. Mapa aberto pelo botão "Abrir localização no mapa"
