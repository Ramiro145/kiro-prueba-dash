import { TestBed } from '@angular/core/testing';
import { KpiBand } from './kpi-band';

describe('KpiBand', () => {
  it('renders metric labels, values, context and tones as one operational band', async () => {
    await TestBed.configureTestingModule({ imports: [KpiBand] }).compileComponents();
    const fixture = TestBed.createComponent(KpiBand);
    fixture.componentRef.setInput('items', [
      {
        id: 'oee',
        label: 'OEE',
        value: '78.0%',
        supportingText: 'Meta ≥ 85.0%',
        tone: 'warning',
      },
      {
        id: 'quality',
        label: 'Calidad',
        value: '98.0%',
        supportingText: 'Unidades conformes',
        tone: 'positive',
      },
    ]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const metrics = element.querySelectorAll('[data-testid="kpi-item"]');

    expect(metrics).toHaveLength(2);
    expect(metrics[0].getAttribute('data-tone')).toBe('warning');
    expect(metrics[0].textContent).toContain('OEE');
    expect(metrics[0].textContent).toContain('78.0%');
    expect(metrics[0].textContent).toContain('Meta ≥ 85.0%');
    expect(metrics[1].getAttribute('data-tone')).toBe('positive');
  });
});
