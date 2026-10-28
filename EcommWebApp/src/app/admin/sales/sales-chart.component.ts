import { afterNextRender, Component, DestroyRef, effect, ElementRef, inject, input, untracked, viewChild } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import Highcharts from 'highcharts';
import { SalesCategory, SalesMonthPoint } from '../../models/sales.model';

type ChartKind = 'profit' | 'trend' | 'category';

function rands(value: number): string {
  const digits = Math.trunc(value).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${grouped}`;
}

@Component({
  selector: 'app-sales-chart',
  template: `<div #host class="w-full"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesChartComponent {
  readonly kind = input.required<ChartKind>();
  readonly months = input<SalesMonthPoint[]>([]);
  readonly categories = input<SalesCategory[]>([]);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private chart?: Highcharts.Chart;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
    afterNextRender(() => this.mount());
    effect(() => {
      const kind = this.kind();
      const months = this.months();
      const categories = this.categories();
      untracked(() => this.paint(kind, months, categories));
    });
  }

  private mount(): void {
    if (this.chart) {
      return;
    }
    this.chart = Highcharts.chart(this.host().nativeElement, this.options(this.kind(), this.months(), this.categories()));
  }

  private paint(kind: ChartKind, months: SalesMonthPoint[], categories: SalesCategory[]): void {
    const chart = this.chart;
    if (!chart) {
      return;
    }
    if (kind === 'category') {
      chart.xAxis[0].setCategories(categories.map((item) => item.name), false);
      chart.series[0].setData(
        categories.map((item) => ({ y: item.share, amount: item.amount, share: item.share })),
        true,
        true,
      );
      chart.setSize(undefined, Math.max(160, categories.length * 48), false);
      return;
    }
    chart.xAxis[0].setCategories(months.map((item) => item.month), false);
    if (kind === 'profit') {
      chart.series[0].setData(months.map((item) => item.profitRands), true, true);
      return;
    }
    chart.series[0].setData(months.map((item) => item.salesRands), false, false);
    chart.series[1].setData(months.map((item) => item.profitRands), true, true);
  }

  private options(kind: ChartKind, months: SalesMonthPoint[], categories: SalesCategory[]): Highcharts.Options {
    const base: Highcharts.Options = {
      chart: { backgroundColor: 'transparent', style: { fontFamily: '"Source Sans 3", sans-serif' }, spacing: [8, 8, 8, 8] },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e6e6e6',
        style: { color: '#141414', fontSize: '13px' },
      },
    };
    if (kind === 'profit') {
      return {
        ...base,
        chart: { ...base.chart, type: 'column', height: 220 },
        xAxis: { categories: months.map((item) => item.month), lineColor: '#e6e6e6', tickColor: '#e6e6e6', labels: { style: { color: '#5c5c5c', fontSize: '13px' } } },
        yAxis: { title: { text: undefined }, gridLineColor: '#eeeeee', labels: { style: { color: '#5c5c5c', fontSize: '12px' }, formatter() { return rands(Number(this.value)); } } },
        plotOptions: { column: { color: '#ff4b1f', borderWidth: 0, pointPadding: 0.28, groupPadding: 0.16 } },
        tooltip: { ...base.tooltip, pointFormatter() { return `<span>Profit: ${rands(this.y ?? 0)}</span>`; } },
        series: [{ type: 'column', name: 'Profit', data: months.map((item) => item.profitRands) }],
      };
    }
    if (kind === 'trend') {
      return {
        ...base,
        chart: { ...base.chart, type: 'line', height: 240 },
        xAxis: { categories: months.map((item) => item.month), lineColor: '#e6e6e6', tickColor: '#e6e6e6', labels: { style: { color: '#5c5c5c', fontSize: '13px' } } },
        yAxis: { title: { text: undefined }, gridLineColor: '#eeeeee', labels: { style: { color: '#5c5c5c', fontSize: '12px' }, formatter() { return rands(Number(this.value)); } } },
        plotOptions: { line: { marker: { enabled: true, radius: 4, symbol: 'circle' } } },
        tooltip: { ...base.tooltip, shared: true, pointFormatter() { return `<span style="color:${this.color}">●</span> ${this.series.name}: ${rands(this.y ?? 0)}<br/>`; } },
        series: [
          { type: 'line', name: 'Sales', color: '#141414', data: months.map((item) => item.salesRands) },
          { type: 'line', name: 'Profit', color: '#ff4b1f', data: months.map((item) => item.profitRands) },
        ],
      };
    }
    return {
      ...base,
      chart: { ...base.chart, type: 'bar', height: Math.max(160, categories.length * 48), marginRight: 120 },
      xAxis: { categories: categories.map((item) => item.name), lineWidth: 0, tickWidth: 0, labels: { style: { color: '#141414', fontSize: '14px' } } },
      yAxis: { visible: false, max: 100, endOnTick: false },
      plotOptions: {
        bar: {
          color: '#ff4b1f',
          borderWidth: 0,
          pointWidth: 8,
          dataLabels: {
            enabled: true,
            inside: false,
            align: 'left',
            x: 8,
            crop: false,
            overflow: 'allow',
            style: { color: '#141414', fontSize: '13px', fontWeight: '400', textOutline: 'none' },
            formatter() {
              const point = this as Highcharts.Point & { amount?: string; share?: number };
              return `${point.amount ?? ''}  ${point.share ?? 0}%`;
            },
          },
        },
      },
      tooltip: {
        ...base.tooltip,
        pointFormatter() {
          const point = this as Highcharts.Point & { amount?: string; share?: number };
          return `<span>${point.amount ?? rands(this.y ?? 0)} · ${point.share ?? 0}% of sales</span>`;
        },
      },
      series: [{
        type: 'bar',
        name: 'Share',
        data: categories.map((item) => ({ y: item.share, amount: item.amount, share: item.share })),
      }],
    };
  }
}
