import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { NavbarBookingComponent } from './navbar-booking.component';

@Component({
  selector: 'app-navbar-booking-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarBookingComponent],
  template: `
    <div class="demo-container">
      <h2>Navbar Booking with Panels Demo</h2>
      <p>Click the phone (message) or bell (billing) icons to open their respective panels.</p>
      
      <app-navbar-booking 
        [isAuthenticated]="true"
        [hotelName]="'Salam Hotel'"
        (signInClick)="onSignInClick()"
        (joinUsClick)="onJoinUsClick()"
        (tripsHistoryClick)="onTripsHistoryClick()"
        (profileClick)="onProfileClick()"
      />
      
      <div class="content">
        <h3>Hotel Booking Platform</h3>
        <p>This is a demonstration of the enhanced navbar with message and billing panels.</p>
        
        <div class="features">
          <h4>Features:</h4>
          <ul>
            <li>📱 <strong>Message Panel</strong> - Click phone icon to view messages</li>
            <li>💰 <strong>Billing Panel</strong> - Click bell icon to view billing information</li>
            <li>🔔 <strong>Badge Counts</strong> - Shows unread message and billing counts</li>
            <li>🌐 <strong>Multi-language</strong> - English/Arabic support</li>
            <li>🎨 <strong>Responsive Design</strong> - Works on all screen sizes</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    h2, h3, h4 {
      color: white;
      padding: 2rem 2rem 0.5rem;
      margin: 0;
    }
    
    h2 {
      font-size: 2rem;
      font-weight: 700;
    }
    
    h3 {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    h4 {
      font-size: 1.25rem;
      font-weight: 500;
    }
    
    p {
      padding: 0 2rem 1rem;
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
    }
    
    .content {
      padding: 2rem;
      max-width: 800px;
    }
    
    .features {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 2rem;
      backdrop-filter: blur(10px);
      margin-top: 2rem;
    }
    
    .features ul {
      list-style: none;
      padding: 0;
      margin: 1rem 0 0 0;
    }
    
    .features li {
      padding: 0.75rem 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .features li:last-child {
      border-bottom: none;
    }
    
    .features strong {
      color: white;
      font-weight: 600;
    }
  `]
})
export class NavbarBookingDemoComponent {
  onSignInClick(): void {
    console.log('Sign In clicked');
  }

  onJoinUsClick(): void {
    console.log('Join Us clicked');
  }

  onTripsHistoryClick(): void {
    console.log('Trips History clicked');
  }

  onProfileClick(): void {
    console.log('Profile clicked');
  }
}
