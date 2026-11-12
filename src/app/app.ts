import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="container header-inner">
        <a routerLink="/tickets" class="brand">HelpDesk Lite</a>
        <span class="muted">Prueba técnica Angular</span>
      </div>
    </header>
    <main class="container main">
      <router-outlet />
    </main>
  `,
  styles: `
    .app-header { background: #141a2e; color: #fff; padding: 14px 0; margin-bottom: 24px; }
    .header-inner { display: flex; align-items: baseline; gap: 16px; }
    .brand { color: #fff; font-weight: 700; font-size: 20px; text-decoration: none; }
    .app-header .muted { color: #aab3cc; }
    .main { padding-bottom: 48px; }
  `,
})
export class App {}
