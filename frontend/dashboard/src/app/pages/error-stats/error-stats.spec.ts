import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorStats } from './error-stats';

describe('ErrorStats', () => {
  let component: ErrorStats;
  let fixture: ComponentFixture<ErrorStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
