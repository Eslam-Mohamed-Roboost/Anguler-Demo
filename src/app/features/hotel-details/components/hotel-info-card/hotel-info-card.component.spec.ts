import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelInfoCardComponent } from './hotel-info-card.component';
import type { HotelInfo } from '../../types/hotel-details.types';

describe('HotelInfoCardComponent', () => {
  let component: HotelInfoCardComponent;
  let fixture: ComponentFixture<HotelInfoCardComponent>;

  const mockHotelInfo: HotelInfo = {
    id: '1',
    code: 'HTL-001',
    name: 'Massa Hotel',
    address: '12 Taq. st., Jadda Square, Egypt.',
    phone: '00215236582458',
    email: 'hdiidjud@gmail.com',
    imageUrl: 'https://example.com/hotel.jpg',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelInfoCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelInfoCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have hotel input defined', () => {
    expect(component.hotel).toBeDefined();
  });

  it('should compute contact info correctly', () => {
    // Test the computed property
    const testComponent = TestBed.createComponent(HotelInfoCardComponent);
    testComponent.componentRef.setInput('hotel', mockHotelInfo);
    testComponent.detectChanges();

    const contactInfo = testComponent.componentInstance.contactInfo();
    expect(contactInfo).toHaveLength(3);
    expect(contactInfo[0].icon).toBe('location-share-02');
    expect(contactInfo[0].text).toBe('12 Taq. st., Jadda Square, Egypt.');
    expect(contactInfo[1].icon).toBe('ci:phone');
    expect(contactInfo[1].text).toBe('00215236582458');
    expect(contactInfo[2].icon).toBe('mdi:email-outline');
    expect(contactInfo[2].text).toBe('hdiidjud@gmail.com');
  });
});
