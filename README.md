# Habits

Dashboard personal oscuro y mobile-first para iPhone (PWA instalable) y PC, construido sobre tokens DTCG sin pasos de compilación y preparado para desplegarse directamente en Vercel.

## Secciones

1. **Hábitos**: lista editable de hábitos con elección de icono y días de la semana, anillo de progreso diario, agua (3 L), suplementos editables, gráfico de evolución de 7 y 30 días, mapa de constancia de 16 semanas y ranking de rachas actuales y mejores marcas.
2. **Agenda**: calendario unificado que junta tus tareas diarias, entregas y exámenes con sincronización automática de Blackboard (Universidad de Sevilla).
3. **Cocina con IA**: inventario de despensa (individual o por lote) y chef con Gemini que genera cada semana un menú completo de 7 días ajustado a tu superávit calórico (2800 a 2900 kcal diarias por defecto), con las comidas de cada día, ingredientes exactos, preparación paso a paso, cambio individual de platos y lista de la compra automática.
4. **Finanzas**: patrimonio consolidado, cartera en tiempo real de Revolut X en euros, diario manual de trading con cálculo automático de PnL y ratio R:R, clipping con RPM e ingresos extra.

## Variables de entorno en Vercel

En **Settings > Environment Variables** de tu proyecto en Vercel puedes configurar:

### 1. IA de cocina (Gemini)

- `GEMINI_API_KEY`: clave de Google AI Studio para generar y cambiar recetas semanales desde `/api/chef` sin exponer la clave en el navegador.

### 2. Sincronización automática entre iPhone y PC (Upstash Redis)

Desde la pestaña **Storage** de Vercel crea una base gratuita **Upstash Redis** (o conéctala desde Marketplace). Vercel añade automáticamente:

- `UPSTASH_REDIS_REST_URL` (también compatible con `KV_REST_API_URL`)
- `UPSTASH_REDIS_REST_TOKEN` (también compatible con `KV_REST_API_TOKEN`)

### 3. Revolut X en tiempo real (opcional)

- `REVX_API_KEY`: tu API Key de solo lectura de Revolut X.
- `REVX_PRIVATE_KEY`: tu clave privada Ed25519 (`revx_private.pem`).

### 4. Contraseña del panel (recomendado)

- `DASHBOARD_TOKEN`: contraseña elegida por ti que protege `/api/state`, `/api/chef` y `/api/revolutx`. Introdúcela una sola vez en **Ajustes** tanto en el iPhone como en el PC.
