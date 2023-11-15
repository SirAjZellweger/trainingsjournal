import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [
      CommonModule, 
      RouterModule,
      MatToolbarModule, 
      MatIconModule, 
      MatButtonModule, 
      MatMenuModule, 
      MatSidenavModule, 
      MatListModule
    ]
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  protected readonly user$ = this.authService.user$;

  title = 'trainingsjournal';

  protected signOut(): void {
    this.authService.signOut().subscribe();
  }
}
