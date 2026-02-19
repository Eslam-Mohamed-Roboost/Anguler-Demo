import { Component, signal } from '@angular/core';
import { DirectionSliderComponent, Direction } from './direction-slider.component';
import { InputComponent } from '../input/input.component';
import { form } from '@angular/forms/signals';

@Component({
  selector: 'app-usage-example',
  standalone: true,
  imports: [DirectionSliderComponent, InputComponent],
  template: `
    <div class="usage-example" [dir]="currentDirection()">
      <h3>Direction Control Example</h3>
      
      <!-- Direction Slider -->
      <app-direction-slider 
        [direction]="currentDirection()" 
        (directionChange)="onDirectionChange($event)"
      />
      
      <!-- Form with Direction Support -->
      <div class="form-example" [class.rtl]="currentDirection() === 'rtl'">
        <app-input 
          label="First Name"
          inputId="firstName"
          placeholder="Enter first name"
          [field]="formFields.firstName"
        />
        <app-input 
          label="Last Name"
          inputId="lastName"
          placeholder="Enter last name"
          [field]="formFields.lastName"
        />
      </div>
    </div>
  `,
  styles: [`
    .usage-example {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .form-example {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-example.rtl {
      direction: rtl;
    }
    
    h3 {
      margin-bottom: 1rem;
      font-weight: 600;
    }
  `]
})
export class UsageExampleComponent {
  readonly currentDirection = signal<Direction>('ltr');
  
  readonly formData = signal({
    firstName: '',
    lastName: ''
  });
  
  readonly formFields = form(this.formData);
  
  onDirectionChange(direction: Direction): void {
    this.currentDirection.set(direction);
  }
}
