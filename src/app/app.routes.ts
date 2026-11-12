import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./features/tickets/pages/ticket-list/ticket-list').then((m) => m.TicketList),
  },
  {
    path: 'tickets/:id',
    loadComponent: () =>
      import('./features/tickets/pages/ticket-detail/ticket-detail').then((m) => m.TicketDetail),
  },
  { path: '**', redirectTo: 'tickets' },
];
