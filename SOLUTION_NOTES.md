# Solution Notes

> Escribe con tus palabras. Respuestas concretas y referidas a ESTE proyecto valen más que explicaciones genéricas.

## 1. Problemas detectados

| # | Síntoma / problema | Causa raíz | ¿Arreglado? | Archivo(s) |
|---|--------------------|------------|-------------|------------|
| 1 | Bug 4: SLA incorrecto | Incloncluencias con  las bussiness rules de las definiciones de cada tipo de status con su tiempo mas las horas laborables | si |  |
| 2 | Bug 3: cambio de estado poco fiable | El usuario estaba cambiando de status cuando backend devolvia un error, esto en ve de notificarle generaba al usuario una sensación rara de que algo fallaba, ya que no mostraba mensaje de información del error | Si |  |
| 3 | Bug 7: tickets cerrados editables | Se ha resuelto el tema que solo se muestran los posibles cambios de tickets dependiendo del estado en el que te encuentres para que el usuario no puede saltar de uno a otro sin seguir una hoja de ruta segun las reglas de negocio | Si |  |
| 4 | Bug 2: errores invisibles, se queda en "Cargando…" | cuando el servidor fallaba se quedaba pendiente la busqueda de tickets y no se actualizaba en loading y por tanto no ntificaba correctamente al usuario  | si |  |
| 5 | Feat 2B: añadir comentario | No estaba la funcionalidad de comentarios y se ha añadidio para que cualquier ticket que no esté closed pueda añadirlo teniendo en cuenta el orden, ciertas regex y condiciones de negocio para las cancelled | Si |  |
| 6 | Bug 1: búsqueda inconsistente | cada tecla lanzaba una pretición y no se gestionaba bien los operadores para cancelar la anterior ni el tiempo | si |  |

## 2. Problemas NO reportados por QA que has encontrado

-

## 3. Decisiones técnicas

Explica las 2–3 decisiones más importantes y qué alternativa descartaste en cada una.

-

## 4. Gestión de estado

¿Dónde vive el estado de filtros, listado, detalle y formulario? ¿Por qué?

## 5. Tests añadidos

| Test | Qué protege | Por qué lo elegiste |
|------|-------------|---------------------|
| sla.spec.ts | las reglas de negocio sobre los estados y sus horarios laborales |  |

## 6. Qué NO has hecho y por qué

-

## 7. Uso de IA

- Herramienta(s): Cursor con agente de IA Clade Haiku 5.5
- Para qué la usaste: Para detectar los fallos y que me facilitase la resolucion de estos
- Una sugerencia de la IA que descartaste o corregiste, y por qué:

## 8. Con un día más...

-
