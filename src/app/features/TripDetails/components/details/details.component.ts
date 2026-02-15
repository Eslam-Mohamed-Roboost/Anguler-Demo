import { Component, signal } from '@angular/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { form } from '@angular/forms/signals';
interface TripDetalsModel{
    Destinations: string,
    TripID: string,
    StartDate: Date,
    EndDate: Date,
    Fare: number,
    PassengerName:string
}
   
@Component({
  selector: 'app-details',
  imports: [InputComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})

 
export class DetailsComponent {
  protected readonly formModel = signal<TripDetalsModel>({
    Destinations: '',
    TripID: '',
    StartDate: new Date(),
    EndDate: new Date(),
    Fare: 0,
    PassengerName:''
  });
    protected readonly f = form(this.formModel);

}
