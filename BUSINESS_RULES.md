# Reglas de negocio — HelpDesk Lite

Este documento es la **fuente de verdad funcional**. Si el código contradice este documento, el código está mal.

## 1. SLA (tiempo máximo de resolución)

| Prioridad | SLA |
|-----------|-----|
| `critical` | 4 horas laborables |
| `high`     | 8 horas laborables |
| `medium`   | 24 horas laborables |
| `low`      | 72 horas laborables |

- **Horario laborable:** lunes a viernes de 09:00 a 18:00 (hora local). Fuera de ese horario el reloj del SLA está parado.
- El SLA se cuenta desde la fecha de creación del ticket.
- Estados del indicador:
  - `ok`: se ha consumido menos del 75 % del SLA.
  - `at_risk`: se ha consumido el 75 % o más, sin superarlo.
  - `breached`: se ha superado el SLA.
- Los tickets **cerrados no muestran indicador de SLA**.

## 2. Transiciones de estado permitidas

| Desde | Hacia |
|-------|-------|
| `open` | `in_progress`, `closed` |
| `in_progress` | `waiting_customer`, `closed` |
| `waiting_customer` | `in_progress`, `closed` |
| `closed` | `open` (reabrir) — **solo si se cerró hace 7 días o menos** |

- Cualquier otra transición no debe ofrecerse en la interfaz.
- Si el servidor rechaza un cambio, el usuario debe saberlo y la interfaz debe reflejar el estado real.

## 3. Comentarios

- Longitud mínima: **10 caracteres** (sin contar espacios al inicio y al final).
- Longitud máxima: **500 caracteres**.
- Se pueden añadir comentarios en cualquier estado **excepto** `closed`.
- Los comentarios se muestran del más antiguo al más reciente.

## 4. Seguridad

- El contenido introducido por usuarios nunca debe poder ejecutar código en el navegador de otros usuarios.
