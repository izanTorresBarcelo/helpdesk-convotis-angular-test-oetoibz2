/**
 * "Base de datos" en memoria que simula el backend.
 * Representa el contrato REAL del servidor (snake_case, fechas ISO, HTML en comentarios).
 *
 * ⚠️ No modifiques este fichero ni el interceptor salvo que lo justifiques en SOLUTION_NOTES.md:
 * simulan un servidor que no controlas.
 */

export interface ServerComment {
  id: string;
  author: string;
  body_html: string;
  created_at: string;
}

export interface ServerTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requester: string;
  assignee: string | null;
  created_at: string;
  closed_at: string | null;
  comments: ServerComment[];
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export const FAKE_DB: ServerTicket[] = [
  {
    id: 'T-1001', title: 'No puedo iniciar sesión en el portal', description: 'Desde esta mañana el portal devuelve "credenciales inválidas".',
    status: 'open', priority: 'critical', requester: 'Lucía Martín', assignee: null,
    created_at: ago(2 * HOUR), closed_at: null,
    comments: [{ id: 'C-1', author: 'Lucía Martín', body_html: 'He probado en dos navegadores distintos.', created_at: ago(90 * 60_000) }],
  },
  {
    id: 'T-1002', title: 'Error al exportar factura a PDF', description: 'El botón "Exportar" se queda cargando.',
    status: 'in_progress', priority: 'high', requester: 'Carlos Ruiz', assignee: 'Ana Gómez',
    created_at: ago(6 * HOUR), closed_at: null,
    comments: [
      { id: 'C-2', author: 'Ana Gómez', body_html: 'Reproducido. Revisando el servicio de <strong>exportación</strong>.', created_at: ago(5 * HOUR) },
      {
        id: 'C-3', author: 'Carlos Ruiz',
        body_html: 'Adjunto captura <img src="x" onerror="console.warn(\'⚠️ XSS ejecutado desde un comentario (T-1002)\'); document.title=\'XSS\'">',
        created_at: ago(4 * HOUR),
      },
    ],
  },
  {
    id: 'T-1003', title: 'Solicitud de alta de usuario', description: 'Nueva incorporación en el equipo de ventas.',
    status: 'waiting_customer', priority: 'low', requester: 'Marta León', assignee: 'Pedro Sanz',
    created_at: ago(3 * DAY), closed_at: null, comments: [],
  },
  {
    id: 'T-1004', title: 'La app móvil se cierra al abrir pedidos', description: 'Solo ocurre en Android 15.',
    status: 'open', priority: 'high', requester: 'Jorge Peña', assignee: null,
    created_at: ago(26 * HOUR), closed_at: null, comments: [],
  },
  {
    id: 'T-1005', title: 'Cambiar logo en el email de bienvenida', description: 'Marketing ha enviado el nuevo logo.',
    status: 'closed', priority: 'low', requester: 'Elena Prieto', assignee: 'Ana Gómez',
    created_at: ago(20 * DAY), closed_at: ago(12 * DAY), comments: [],
  },
  {
    id: 'T-1006', title: 'Lentitud en el listado de clientes', description: 'Tarda más de 10 segundos en cargar.',
    status: 'in_progress', priority: 'medium', requester: 'Raúl Ortega', assignee: 'Pedro Sanz',
    created_at: ago(30 * HOUR), closed_at: null, comments: [],
  },
  {
    id: 'T-1007', title: 'Pagos duplicados en pasarela', description: 'Algunos clientes reportan cargos dobles.',
    status: 'open', priority: 'critical', requester: 'Sonia Vidal', assignee: 'Ana Gómez',
    created_at: ago(5 * HOUR), closed_at: null,
    comments: [{ id: 'C-4', author: 'Ana Gómez', body_html: 'Ticket bloqueado por el equipo de pagos mientras se investiga.', created_at: ago(4 * HOUR) }],
  },
  {
    id: 'T-1008', title: 'Actualizar política de contraseñas', description: 'Requisito de auditoría.',
    status: 'closed', priority: 'medium', requester: 'Iván Cano', assignee: 'Pedro Sanz',
    created_at: ago(9 * DAY), closed_at: ago(2 * DAY), comments: [],
  },
  {
    id: 'T-1009', title: 'Traducción incompleta en la versión inglesa', description: 'Faltan textos en el checkout.',
    status: 'open', priority: 'medium', requester: 'Nuria Gil', assignee: null,
    created_at: ago(20 * HOUR), closed_at: null, comments: [],
  },
  {
    id: 'T-1010', title: 'Revisar permisos del rol "auditor"', description: 'Puede ver datos que no debería.',
    status: 'in_progress', priority: 'critical', requester: 'Iván Cano', assignee: 'Ana Gómez',
    created_at: ago(7 * HOUR), closed_at: null, comments: [],
  },
  {
    id: 'T-1011', title: 'Petición de nuevo informe mensual', description: 'Ventas por región y canal.',
    status: 'waiting_customer', priority: 'low', requester: 'Marta León', assignee: 'Pedro Sanz',
    created_at: ago(6 * DAY), closed_at: null, comments: [],
  },
  {
    id: 'T-1012', title: 'Certificado SSL caduca pronto', description: 'Caduca en 10 días.',
    status: 'open', priority: 'high', requester: 'Raúl Ortega', assignee: null,
    created_at: ago(3 * HOUR), closed_at: null, comments: [],
  },
];
