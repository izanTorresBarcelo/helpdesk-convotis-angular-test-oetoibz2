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

- En QA aunque se quejaban del problema de cambiar el status de los tickets cerrados, que eran editables incluso pasado el tiempo. Lo que pasaba es que cualquier usuario podía cambiar el estado a cualquier otro estado sin tener en cuenta las reglas del negocio. podías pasar de open a waiting customer, lo que se ha hecho es solo mostrar las posibilidades de cada estado.
- Cuando entras algun ticket y vuelve a llamar a todo el listado, tal vez sería ua mejora de que el listado se mantenga y tal vez añadir un boton de refrescar si fuese necesario. No se ha realizado por tiempo.

## 3. Decisiones técnicas

Explica las 2–3 decisiones más importantes y qué alternativa descartaste en cada una.

- Tuve en cuenta las reglas de negocio sobre todo en la tarea donde funcionaba mal SLA y descarté que se tuviera en cuenta cualquier hora para que se considerara de aplicar el horario laboral de la empresa de tickets.
- En el tema del search elegí poner un debouncetime de 300ms y poder cancelar la petición anterior con un siwtchmap para no saturar al servidor de llamadas si el usario ha decidido seguir escribiendo o borrando y que haya un espacio de tiempo para detectar cuando el usuario termina.Por tanto descarté el lanzar una petición con cada tecla.

## 4. Gestión de estado

¿Dónde vive el estado de filtros, listado, detalle y formulario? ¿Por qué?
Vive en ticket-list.ts y en ticket-detail.ts. No debería ser así, ya que cierta lógica de negocios, llamadas https deberían estar en servicios, extrayendo esa lógica.

## 5. Tests añadidos

| Test | Qué protege | Por qué lo elegiste |
|------|-------------|---------------------|
| sla.spec.ts | las reglas de negocio sobre los estados y sus horarios laborales |  |

## 6. Qué NO has hecho y por qué

- Por ejemplo en el tema de search, obligar al usuario introducir al menos 3 caracteres para que la búsqueda inicie, el motivo más que nada darle prioridad a otros bugs.
- Se podría haber hecho una paginación para el listado de tickets, ya que ahora son pocos, pero si aumentan eso podría generar problemas de tiempos y saturación al ser una petición tan grande a servidor. Lo único de esto es que se necesitaría más tiempo y pensar en una arquitectura solida que también requeriría cambios de back.
-Pensar en alguna futura mejora o escalabilidad como por ejemplo pensar en añadir una store si fuese necesario.

## 7. Uso de IA

- Herramienta(s): IDE Cursor con agente de IA Clade Haiku 5.5 medium. Consola del nagegador.
- Para qué la usaste: Principalmente le puse en contexto de la aplicación y de las bussiness rules además de que aplicara y tuviera en cuenta las convenciones del proyecto si las había y las buenas prácticas de angular 22. Junto a esto viendo por mi parte cual eran las issues o funcionalidades prioritarias, la IA me ayudó a que con el contexto que le daba me encontrara en que archivos estaba el posible fallo y arreglarlo, además de también el alguna tarea me diese alguna idea de encontrar el fallo más rápdido. Una vez realizado el cambio y revisado por mi parte validaba los test que ella misma había creado.
- Una sugerencia de la IA que descartaste o corregiste, y por qué: Por ejemplo me cambio los labes que se mostraban en modo código como "at_risk" y me las cambió a un formato más legible como "En Riesgo", si que es un cambio que le cuestioné porque no se pedió, pero al final lo dejé debido a que no me pareció mal, aunque en casos reales sería comunicarlo a cliente estas ideas para que tomen ellos las decisiones.

## 8. Con un día más...

- Me huibiera gustado revisar más en profundidad ciertos temas como memory leaks en la aplicación, interfaces, he visto varios tipados any, no se trabaja correctamente con rxjs, etc
- Profundizar más en los bugs reportados y en los que no.
- Revisar la saturacion de los logs en la consola
- Documentar mejor la prueba.
