# Componentes UI Reutilizables

Biblioteca de componentes UI construidos con React Native y NativeWind (Tailwind CSS).

## Componentes Disponibles

### Button

Botón reutilizable con diferentes variantes y tamaños.

**Props:**
- `title` (string, requerido): Texto del botón
- `variant` ('primary' | 'secondary' | 'outline'): Estilo del botón (default: 'primary')
- `size` ('sm' | 'md' | 'lg'): Tamaño del botón (default: 'md')
- `className` (string): Clases adicionales de Tailwind
- Todas las props de `Pressable` de React Native

**Ejemplo:**
```tsx
import { Button } from '../components/ui';

<Button 
  title="Iniciar Sesión" 
  variant="primary" 
  size="lg"
  onPress={handleLogin}
/>
```

**Variantes:**
- `primary`: Fondo azul (bg-blue-600)
- `secondary`: Fondo índigo (bg-indigo-600)
- `outline`: Fondo blanco con borde gris

---

### Input

Campo de entrada con label, manejo de focus y validación de errores.

**Props:**
- `label` (string, requerido): Etiqueta del campo
- `error` (string): Mensaje de error a mostrar
- `containerClassName` (string): Clases para el contenedor
- Todas las props de `TextInput` de React Native

**Ejemplo:**
```tsx
import { Input } from '../components/ui';

<Input
  label="Correo Electrónico"
  placeholder="ejemplo@correo.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errors.email}
/>
```

**Características:**
- Borde animado al hacer focus (azul por defecto, rojo si hay error)
- Manejo automático de estados focus/blur
- Mensaje de error debajo del campo

---

### Header

Encabezado decorativo con título, subtítulo opcional y botón de regreso.

**Props:**
- `title` (string, requerido): Título principal
- `subtitle` (string): Subtítulo descriptivo
- `bgColor` (string): Color de fondo Tailwind (default: 'bg-blue-600')
- `showBackButton` (boolean): Mostrar botón de regreso
- `onBack` (function): Callback al presionar el botón de regreso
- `icon` (string): Emoji o icono para mostrar junto al título

**Ejemplo:**
```tsx
import { Header } from '../components/ui';

<Header 
  title="¡Hola!"
  subtitle="Bienvenido de vuelta"
  icon="👋"
  bgColor="bg-blue-600"
/>

<Header
  title="Crear Cuenta"
  subtitle="Únete a nosotros"
  icon="✨"
  bgColor="bg-indigo-600"
  showBackButton
  onBack={() => router.back()}
/>
```

---

### Card

Contenedor con sombra y bordes redondeados.

**Props:**
- `children` (ReactNode, requerido): Contenido de la tarjeta
- `className` (string): Clases adicionales de Tailwind
- Todas las props de `View` de React Native

**Ejemplo:**
```tsx
import { Card } from '../components/ui';

<Card className="mb-6">
  <Text>Contenido de la tarjeta</Text>
</Card>

<Card className="bg-blue-50 border-2 border-blue-200">
  <Text className="text-blue-800 font-bold">Información</Text>
</Card>
```

---

### DividerWithText

Divisor horizontal con texto en el centro.

**Props:**
- `text` (string, requerido): Texto a mostrar en el divisor

**Ejemplo:**
```tsx
import { DividerWithText } from '../components/ui';

<DividerWithText text="O continúa con" />
```

---

## Importación

Todos los componentes pueden importarse desde el archivo index:

```tsx
import { Button, Input, Header, Card, DividerWithText } from '../components/ui';
```

O individualmente:

```tsx
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
```

## Personalización

Todos los componentes aceptan la prop `className` para agregar estilos personalizados de NativeWind:

```tsx
<Button 
  title="Mi Botón" 
  className="mt-4 shadow-lg"
/>

<Card className="bg-gradient-to-r from-blue-500 to-purple-500">
  {/* Contenido */}
</Card>
```

## Notas de Estilo

- Todos los componentes usan NativeWind para los estilos
- Los colores predeterminados siguen una paleta azul/índigo
- Los componentes son totalmente personalizables via props o className
