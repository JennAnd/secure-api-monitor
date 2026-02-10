import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityEvents } from './security-events';

describe('SecurityEvents', () => {
  let component: SecurityEvents;
  let fixture: ComponentFixture<SecurityEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
