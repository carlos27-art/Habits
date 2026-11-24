# Habits

Panel personal minimalista y mobile-first diseñado sobre tokens DTCG, preparado para desplegarse directamente en Vercel como PWA instalable en móvil y escritorio, y con integración en tiempo real con Revolut X.

## Vistas principales

1. **Hoy**: porcentaje diario protagonista, tarjeta contextual del bloque actual, selector rápido de día, agenda cronológica con suplementos, agua (3 L), tareas del día y próximo examen.
2. **Semana**: curva semanal interactiva, matriz de consistencia de 7 días y ranking de rachas activas.
3. **Universidad**: sincronización automática con el calendario ICS de Blackboard (Universidad de Sevilla) mediante proxy propio en servidor y cuenta atrás de exámenes.
4. **Finanzas**: patrimonio consolidado, cartera en tiempo real de Revolut X valorada en euros, diario manual de trading con cálculo automático de PnL y ratio R:R, contador de YouTube, clipping e ingresos extra.
5. **Nutrición**: escáner de comidas por foto con IA (Gemini u OpenAI con clave guardada solo en el dispositivo), objetivos de calorías y macronutrientes y balance semanal.

## Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. En Vercel pulsa **Add New Project** e importa el repositorio `Habits`.
3. No hace falta configurar comando de compilación: Vercel sirve los activos estáticos en la raíz y ejecuta automáticamente las funciones serverless de `api/`.
4. Para instalarlo como app nativa en iOS o Android: abre la URL de Vercel en Safari (iOS) o Chrome (Android) y elige **Añadir a pantalla de inicio**.

## Conectar Revolut X en tiempo real

La API de Revolut X firma cada petición con criptografía asimétrica **Ed25519**. Para que tus claves privadas nunca viajen al navegador ni aparezcan en GitHub, la firma ocurre exclusivamente en el servidor (`api/revolutx.js`).

### Paso 1: Generar tu par de claves Ed25519

Ejecuta estos dos comandos en tu terminal local (con OpenSSL instalado):

```bash
openssl genpkey -algorithm ed25519 -out revx_private.pem
openssl pkey -in revx_private.pem -pubout -out revx_public.pem
```

No subas nunca `revx_private.pem` al repositorio.

### Paso 2: Crear la API Key en Revolut X

1. Entra en la aplicación web de **Revolut X** y abre el apartado de **API Keys** en tu perfil.
2. Crea una nueva clave con permisos de **solo lectura** (lectura de saldos y mercado).
3. Pega el contenido completo de `revx_public.pem` cuando Revolut X te pida la clave pública.
4. Copia la cadena alfanumérica de 64 caracteres que te entrega Revolut X (`API Key`).

### Paso 3: Configurar las variables de entorno en Vercel

En tu proyecto de Vercel entra en **Settings > Environment Variables** y añade:

- `REVX_API_KEY`: tu API Key de 64 caracteres de Revolut X.
- `REVX_PRIVATE_KEY`: el contenido completo de `revx_private.pem` (incluyendo las líneas `BEGIN PRIVATE KEY` y `END PRIVATE KEY`, o en una sola línea).
- `DASHBOARD_TOKEN` (recomendado si la URL de Vercel es pública): una contraseña personal elegida por ti para proteger el endpoint `/api/revolutx`. Si la defines, introdúcela una sola vez en **Finanzas > Revolut X > Conexión** en tu móvil y ordenador.

Vuelve a desplegar (**Redeploy**) para aplicar las variables. Al abrir la pestaña **Finanzas**, el panel consultará `/api/revolutx`, valorará cada posición y activo en staking en euros con variación de 24 horas y actualizará automáticamente tu patrimonio cada 30 segundos mientras la vista esté activa.
