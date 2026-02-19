import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileTabsComponent } from './profile-tabs.component';

describe('ProfileTabsComponent', () => {
  let component: ProfileTabsComponent;
  let fixture: ComponentFixture<ProfileTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileTabsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
