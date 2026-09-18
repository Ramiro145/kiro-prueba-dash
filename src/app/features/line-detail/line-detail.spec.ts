import { TestBed } from '@angular/core/testing';
import { LineDetail } from './line-detail';

describe('LineDetail', () => {
  it('identifies the line detail workspace', async () => {
    await TestBed.configureTestingModule({ imports: [LineDetail] }).compileComponents();
    const fixture = TestBed.createComponent(LineDetail);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Detalle de línea',
    );
  });
});
