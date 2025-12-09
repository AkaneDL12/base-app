# Base App con Expo, NativeWind, TypeScript y Reanimated

Este proyecto es una configuración base de Expo SDK 54 con soporte completo para NativeWind v4.2.1, utilizando TypeScript y compatible con React Native Reanimated 3.17.4.

## Estructura del proyecto

```
base-app/
├── App.tsx
├── global.css
├── nativewind-env.d.ts
├── tailwind.config.js
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── package.json
```

## Instalación

Clona el proyecto y entra en la carpeta:

```bash
git clone <tu-repo>
cd base-app
```

Instala todas las dependencias:

```bash
npm install
```

## Dependencias principales

* expo ~54.0.13
* expo-status-bar ~3.0.8
* react 19.1.0
* react-native 0.81.4
* nativewind ^4.2.1
* react-native-reanimated ~3.17.4
* react-native-safe-area-context ^5.4.0
* react-native-worklets ^0.6.1

Dev dependencies:

* @types/react ~19.1.0
* babel-preset-expo ^54.0.4
* prettier-plugin-tailwindcss ^0.5.14
* tailwindcss ^3.4.18
* typescript ~5.9.2

## Configuración

### babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ],
    plugins: [
      "react-native-reanimated/plugin"
    ],
  };
};
```

### metro.config.js

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
});
```

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### nativewind-env.d.ts

```ts
/// <reference types="nativewind/types" />
declare module "*.css";
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "moduleResolution": "bundler",
    "types": ["nativewind/types"],
    "skipLibCheck": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "nativewind-env.d.ts"
  ]
}
```

## Verificación

En App.tsx prueba con este código:

```tsx
import { View, Text } from "react-native";
import "./global.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-white text-xl font-bold">
        NativeWind y Reanimated funcionando
      </Text>
    </View>
  );
}
```

Ejecuta el proyecto:

```bash
npx expo start -c
```

Deberías ver un fondo azul con el texto centrado, confirmando que NativeWind y Reanimated funcionan correctamente.

## Comandos útiles

```bash
npm run start       # Inicia el servidor Expo
npm run android     # Ejecuta en Android
npm run ios         # Ejecuta en iOS
npm run web         # Ejecuta en navegador
npx expo start -c   # Limpia caché y arranca
```

## Créditos

Documentación consultada:

* NativeWind
* Expo
* Tailwind CSS

Autor: Junior Leonardo Wachapa Yankur
