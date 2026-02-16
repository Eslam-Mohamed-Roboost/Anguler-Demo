import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { form } from '@angular/forms/signals';
interface TripDetalsModel{
    Destinations: string,
    TripID: string,
    StartDate: Date,
    EndDate: Date,
    Fare: number,
    PassengerName:string,
    Status: 'Completed' | 'Ongoing' | 'Cancelled',
    DriverName: string,
    DriverRating: number,
    DriverPhone: string,
    FromLocation: string,
    ToLocation: string,
    PaymentMethod: string
}
   
@Component({
  selector: 'app-details',
  imports: [DatePipe, BadgeComponent, IconComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})

 
export class DetailsComponent {
  protected readonly formModel = signal<TripDetalsModel>({
    Destinations: 'Cairo International Airport - Tahrir Square',
    TripID: 'TRIP-2024-001',
    StartDate: new Date('2024-02-15T10:30:00'),
    EndDate: new Date('2024-02-15T11:15:00'),
    Fare: 125.50,
    PassengerName: 'John Doe',
    Status: 'Completed',
    DriverName: 'Ahmed Ali',
    DriverRating: 5,
    DriverPhone: '+20 123 456 7890',
    FromLocation: 'Cairo International Airport',
    ToLocation: 'Tahrir Square',
    PaymentMethod: 'Visa ****1234'
  });
    protected readonly f = form(this.formModel);

}
