# HelpDesk Lite — Prueba técnica Angular

Bienvenido/a. Esta prueba simula una situación real: heredas una pequeña aplicación de gestión de tickets de soporte, **funciona a medias**, tiene bugs reportados por QA, algo de deuda técnica y un par de funcionalidades pendientes.

No buscamos que lo arregles todo. Buscamos ver **cómo diagnosticas, priorizas, decides y explicas**.

## Stack

- Angular 22 (standalone, **zoneless**, signals, control flow `@if/@for`)
- RxJS 7
- Vitest para tests unitarios
- Backend simulado con un interceptor HTTP (`src/app/core/api`)

## Cómo empezar

1. Abre el enlace de StackBlitz que te hemos enviado e **inicia sesión**.
2. Pulsa **Fork** para crear tu copia. Trabaja siempre sobre tu fork.
3. La app arranca sola (`npm start`). Abre la consola del navegador: el backend simulado registra cada petición como `[fake-api]`.
4. Al terminar, envía la **URL de tu fork** (y, si trabajas con GitHub, el enlace al repositorio con tus commits).

> Si trabajas conectado a GitHub, haz **commits pequeños y descriptivos**, idealmente uno por tarea. El historial también forma parte de la evaluación.

## Tiempo

- **2h30** de trabajo. Si se te acaba el tiempo, para y documenta lo que harías después.
- Después habrá una **revisión técnica de 30–45 min** en la que defenderás tu solución y haremos algún cambio en directo.

## Uso de IA

Puedes usar documentación, buscadores, Copilot o cualquier asistente de IA. **No se penaliza.**

Lo que sí se evalúa es que entiendas, puedas explicar y puedas modificar en directo todo lo que entregues. Indica en `SOLUTION_NOTES.md` cómo has usado la IA.

## Reglas

- No modifiques `src/app/core/api/*` (simula un servidor que no controlas). Si crees que debes hacerlo, justifícalo.
- Lee `BUSINESS_RULES.md`: es la fuente de verdad funcional.
- Prioriza. Es mejor arreglar menos cosas bien y explicar el resto que tocarlo todo sin criterio.

---

## Parte 1 — Bugs reportados por QA (obligatorio)

QA describe **síntomas**, no causas. Encontrar la causa raíz es parte de la prueba.

1. **Búsqueda inconsistente.** Al escribir rápido en el buscador (por ejemplo `pago`), a veces la lista termina mostrando resultados que no corresponden con el texto escrito.
2. **Errores invisibles.** Si el servidor falla (busca `boom`), la pantalla se queda "Cargando…" para siempre y nunca aparece un mensaje de error.
3. **Cambio de estado poco fiable.** En el detalle de `T-1007`, al cambiar el estado parece que funciona, pero a los pocos segundos vuelve al estado anterior sin ningún aviso.
4. **SLA incorrecto.** El indicador de SLA no coincide con lo definido en `BUSINESS_RULES.md`.
5. **Navegación entre tickets.** En el detalle, los enlaces "Anterior / Siguiente" cambian la URL pero no el contenido.
6. **Consola saturada.** Tras navegar varias veces entre listado y detalle, la consola se llena de peticiones `[fake-api]` aunque no estés en ningún detalle.
7. **Tickets cerrados editables.** Se puede cambiar el estado de cualquier ticket, incluso cerrados, sin respetar las transiciones permitidas.

## Parte 2 — Funcionalidades (obligatorio)

**A. Filtros en la URL.** El listado debe permitir filtrar por texto, estado **y prioridad**, y los filtros deben reflejarse en los query params (`/tickets?q=pago&status=open&priority=critical`):
- Al recargar la página se mantienen los filtros.
- Los botones atrás/adelante del navegador funcionan de forma coherente.

**B. Añadir comentario.** En el detalle, un formulario para añadir comentarios según `BUSINESS_RULES.md`:
- Validación visible y accesible.
- Mientras se envía, no se puede enviar dos veces.
- Si el envío falla (incluye la palabra `fail` en el texto), **no se pierde lo escrito** y se informa al usuario.

## Parte 3 — Tests (obligatorio)

Añade **al menos 3 tests útiles**. Uno de ellos debe cubrir las reglas de SLA. `npm test` los ejecuta (si en StackBlitz no funcionan, indícalo y deja los tests escritos).

## Parte 4 — Notas (obligatorio)

Completa `SOLUTION_NOTES.md`.

## Importante

El código tiene **más problemas de los que QA ha reportado** (calidad, rendimiento, accesibilidad, seguridad, tipado...). Detectarlos, priorizarlos y decidir cuáles arreglar y cuáles solo documentar también forma parte de la evaluación.

## Bonus (opcional, solo si te sobra tiempo)

- Revisión de accesibilidad del listado.
- Extraer el estado de la feature a un store/facade si lo consideras justificado.
- Usar Signal Forms o `httpResource`/`rxResource` donde tenga sentido (justifica la elección).
- Explicar cómo escalaría el listado a 50.000 tickets.
