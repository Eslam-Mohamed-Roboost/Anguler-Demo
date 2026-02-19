import { Component, signal } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-billing-usage-example',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <div class="usage-example">
      <h2>Billing Panel Integration</h2>
      <p>Click the notification (alert-triangle) icon in the navbar to open the billing panel.</p>
      
      <app-navbar 
        [messageCount]="2"
        [notificationCount]="3"
        [showNavIcons]="true"
        (messageClick)="onMessageClick()"
        (notificationClick)="onNotificationClick()"
        (menuToggle)="onMenuToggle()"
      />
      
      <div class="content">
        <h3>Page Content</h3>
        <p>This is the main content area. The billing panel slides in from the right when you click the notification icon.</p>
      </div>
    </div>
  `,
  styles: [`
    .usage-example {
      min-height: 100vh;
      background: #f9fafb;
    }
    
    h2 {
      padding: 2rem 2rem 1rem;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #374151;
    }
    
    p {
      padding: 0 2rem 1rem;
      margin: 0;
      color: #6b7280;
    }
    
    .content {
      padding: 2rem;
      max-width: 800px;
    }
    
    .content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
    }
    
    .content p {
      color: #374151;
      line-height: 1.6;
    }
  `]
})
export class BillingUsageExampleComponent {
  onMessageClick(): void {
    console.log('Message icon clicked');
  }

  onNotificationClick(): void {
    console.log('Notification icon clicked - billing panel opens');
  }

  onMenuToggle(): void {
    console.log('Menu toggled');
  }
}
