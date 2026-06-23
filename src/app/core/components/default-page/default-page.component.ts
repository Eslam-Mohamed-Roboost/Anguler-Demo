import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-default-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './default-page.component.html',
  styleUrl: './default-page.component.css',
})
export class DefaultPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const target = this.authService.hasAnyRole(['admin', 'hotel']) ? '/hotel-details' : '/home';

    void this.router.navigateByUrl(target, { replaceUrl: true });
  }
}
