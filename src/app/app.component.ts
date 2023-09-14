import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgSwitch, NgSwitchDefault, NgSwitchCase, CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterOutlet]
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  protected readonly user$ = this.authService.user$;

  title = 'trainingsjournal';

  protected loginWithGoogle(): void {
    this.authService.signInWithGoogle().pipe(take(1)).subscribe();
  }

  protected signOut(): void {
    this.authService.signOut().pipe(take(1)).subscribe();
  }
}
