import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface SaleStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  protected readonly stats = signal<SaleStat[]>([
    { label: 'Total sales', value: 'R 186 400' },
    { label: 'Orders', value: '42' },
    { label: 'Profit', value: 'R 61 200' },
    { label: 'This month', value: 'R 42 180' },
  ]);
}
