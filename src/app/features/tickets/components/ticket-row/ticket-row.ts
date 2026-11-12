import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { STATUS_LABELS, Ticket } from '../../models/ticket';
import { SLA_LABELS, slaState } from '../../domain/sla';

@Component({
  selector: 'app-ticket-row',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <span class="dot" [style.background]="priorityColor()"></span>
      <div class="main">
        <div class="title">
          <span class="id">{{ ticket().id }}</span> {{ ticket().title }}
        </div>
        <div class="meta muted">
          {{ statusLabel() }} · {{ ticket().requester }} · {{ ticket().createdAt | date: 'short' }}
        </div>
      </div>
      @if (sla(); as s) {
        <span class="sla" [class]="'sla ' + s">{{ slaLabels[s] }}</span>
      }
    </div>
  `,
  styles: `
    .row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff;
           border: 1px solid var(--border); border-radius: 10px; cursor: pointer; }
    .row:hover { border-color: var(--primary); }
    .dot { width: 12px; height: 12px; border-radius: 50%; flex: none; }
    .main { flex: 1; min-width: 0; }
    .title { font-weight: 600; }
    .id { color: var(--muted); font-weight: 500; margin-right: 4px; }
    .meta { font-size: 13px; margin-top: 2px; }
    .sla { font-size: 12px; padding: 2px 8px; border-radius: 99px; background: #eef1f7; }
    .sla.at_risk { background: #fff4d6; color: var(--warning); }
    .sla.breached { background: #fde4e1; color: var(--danger); }
  `,
})
export class TicketRow {
  readonly ticket = input.required<Ticket>();
  protected readonly slaLabels = SLA_LABELS;

  statusLabel() {
    return STATUS_LABELS[this.ticket().status];
  }

  priorityColor() {
    switch (this.ticket().priority) {
      case 'critical': return '#c0352b';
      case 'high': return '#e07b24';
      case 'medium': return '#c9b204';
      default: return '#8a93a8';
    }
  }

  sla() {
    return slaState(this.ticket());
  }
}
