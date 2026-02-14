import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderHistoryComponent } from './rider-history.component';

describe('RiderHistory', () => {
  let component: RiderHistoryComponent;
  let fixture: ComponentFixture<RiderHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiderHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
