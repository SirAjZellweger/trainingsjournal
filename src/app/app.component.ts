import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { take, tap } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteDialogComponent } from './auth/delete-dialog/delete-dialog.component';


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
      MatListModule,
      MatDialogModule,
      MatDividerModule,
      DeleteDialogComponent
    ]
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router)
  private readonly dialog = inject(MatDialog)
  protected readonly user$ = this.authService.user$;

  title = 'trainingsjournal';

  protected signOut(): void {
    this.authService.signOut().pipe(
      tap(() => this.router.navigate(['/login']))
    ).subscribe();
  }

  protected openDeleteDialog(): void {
    this.dialog.open(DeleteDialogComponent).afterClosed().pipe(
      take(1),
      tap(() => this.router.navigate(['/login']))
    )
    .subscribe();
  }
}
