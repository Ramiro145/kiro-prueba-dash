# Acero Control

MVP de supervisión operativa para una planta de transformación de acero. Permite revisar OEE, producción, calidad, paros y alertas de las etapas de Corte, Conformado, Soldadura y Acabado.

La aplicación es de solo consulta: no incluye autenticación, edición de metas, reconocimiento de alertas ni telemetría industrial real.

## Stack

- Angular `22.1.7`, standalone y TypeScript estricto.
- NgRx `22.0.1`: Store, Effects, Entity, Router Store y DevTools.
- Angular CDK `22.1.7` para gestión accesible del foco; los controles visuales del MVP son propios.
- Apache ECharts `6.1.0` con imports modulares y carga diferida.
- Vitest `4.1.11` y jsdom para pruebas.
- IBM Plex Sans y IBM Plex Sans Condensed autohospedadas bajo SIL OFL 1.1; consulta [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Las versiones están fijadas de forma exacta en `package.json` y `package-lock.json`.

## Requisitos

- Node.js compatible con Angular 22. Se recomienda Node 24; el proyecto fue validado con Node `24.20.0`.
- npm `11.19.0` o compatible.

## Instalación y ejecución

```powershell
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200/`. `npm start` inicia un servidor de desarrollo de ejecución prolongada y debe ejecutarse manualmente en una terminal.

Rutas principales:

- `/overview`: resumen de planta.
- `/lines/:lineId`: detalle operativo de una línea.
- `/alerts`: centro de alertas.

Los parámetros `plant`, `shift` y `line` se conservan en la URL para permitir deep-links y recargas compartibles.

## Comandos de calidad

```powershell
npm run format:check
npm run typecheck
npm run test:ci
npm run build
```

- `format:check`: verifica formato con Prettier.
- `typecheck`: ejecuta TypeScript sin generar archivos.
- `test:ci`: ejecuta Vitest una sola vez.
- `build`: genera el bundle de producción en `dist/dashboard-acero`.

## Funcionalidad

### Resumen de planta

- Filtros por planta, turno y línea sincronizados con Router Store.
- OEE, disponibilidad, rendimiento, calidad, producción/meta, scrap y tiempo de paro.
- Mapa del proceso y navegación contextual hacia cada línea.
- Tendencia OEE, producción por hora y Pareto de paros.
- Resumen de alertas activas.
- Polling cada 30 segundos sin solicitudes solapadas.
- Conservación de la última lectura válida durante fallos del mismo contexto.

### Detalle de línea

- Estado, orden activa y KPIs de línea.
- Producción horaria, secuencia de estado, paros, calidad e historial.
- Estados de carga, vacío, error de transporte y línea inexistente.
- Retorno al resumen conservando el contexto de URL.

### Centro de alertas

- Colección normalizada con NgRx Entity.
- Filtros por severidad, estado y línea.
- Orden por severidad y antigüedad.
- Duración calculada para alertas activas y resueltas.
- Navegación a la línea afectada conservando planta y turno.

## Arquitectura

```text
src/app/
├── core/
│   ├── api/                 # Tokens de configuración HTTP
│   ├── mock-api/            # Interceptor y fixtures deterministas
│   └── storage/             # Boundary de localStorage
├── domains/
│   ├── alerts/              # Modelos, API y estado Entity
│   ├── operations/          # Overview, detalle, polling y Router Store
│   └── preferences/         # Hidratación y persistencia visual
├── features/
│   ├── overview/
│   ├── line-detail/
│   └── alerts/
├── layout/                  # Shell responsive y navegación
└── shared/                  # KPI band y adaptador ECharts
```

Los componentes consumen view models mediante selectors. Los efectos concentran HTTP, polling, navegación y persistencia. El estado efímero permanece en signals locales; el estado compartido, asíncrono o persistente vive en NgRx.

ECharts se encapsula en `shared/charts/echart-host`. El motor registra únicamente línea, barra, dataset, ejes, ARIA y Canvas. Los gráficos se cargan mediante `@defer`, incluyen resumen textual y desactivan animaciones canvas.

## API simulada

El interceptor `core/mock-api/mock-api.interceptor.ts` implementa:

```text
GET /api/plants
GET /api/plants/:plantId/overview?shiftId=:shiftId
GET /api/lines/:lineId?shiftId=:shiftId
GET /api/alerts?plantId=:plantId&shiftId=:shiftId
```

Los fixtures usan timestamps y respuestas deterministas para que las pruebas no dependan del reloj local.

### Sustituir el mock por un backend

1. Retirar `withInterceptors([mockApiInterceptor])` de `app.config.ts`.
2. Mantener `provideHttpClient()`.
3. Proveer `API_BASE_URL` con la URL del backend:

```ts
{ provide: API_BASE_URL, useValue: 'https://api.example.com/v1' }
```

4. Implementar los mismos contratos descritos por `OperationsApi`, `AlertsApi` y los modelos de dominio.
5. Ejecutar tests y build antes de desplegar.

Los componentes, reducers y selectors no necesitan cambios si el backend respeta los contratos.

## Accesibilidad y responsive

- Un único landmark `main`, skip link y foco gestionado después de navegar.
- Navegación con `aria-current`, foco visible y controles operables por teclado.
- Estados comunicados mediante texto, icono y color.
- Tablas con caption, scopes y regiones de overflow enfocables.
- Gráficos con ARIA, decals, resúmenes textuales y movimiento desactivado.
- Layout preparado para escritorio, tablet y móvil mediante breakpoints en 1440, 768 y 390 px.

## Alcance de actualización

El resumen mantiene polling operativo cada 30 segundos. Detalle y alertas cargan al entrar o cambiar su contexto y ofrecen reintento ante error. En un backend industrial futuro, estos dos flujos pueden adoptar polling o streaming sin cambiar los componentes, extendiendo sus effects.

## Especificación

El contrato funcional y técnico está documentado en [`specs/01-dashboard-industrial-acero.md`](specs/01-dashboard-industrial-acero.md).
