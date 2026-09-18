import { TestBed } from '@angular/core/testing';
import { Alerts } from './alerts';

describe('Alerts', () => {
  it('identifies the alerts workspace', async () => {
    await TestBed.configureTestingModule({ imports: [Alerts] }).compileComponents();
    const fixture = TestBed.createComponent(Alerts);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Centro de alertas',
    );
  });
});
