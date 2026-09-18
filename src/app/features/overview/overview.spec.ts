import { TestBed } from '@angular/core/testing';
import { Overview } from './overview';

describe('Overview', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Overview],
    }).compileComponents();
  });

  it('presents the first operational dashboard increment', () => {
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Resumen de planta');
    expect(element.textContent).toContain('Corte');
    expect(element.textContent).toContain('Conformado');
    expect(element.textContent).toContain('Soldadura');
    expect(element.textContent).toContain('Acabado');
  });
});
