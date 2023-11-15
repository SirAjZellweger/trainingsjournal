import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { AuthService } from "src/app/auth/auth.service";
import { switchMap, tap } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-page-settings',
  templateUrl: './page-settings.component.html',
  styleUrls: ['./page-settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterOutlet, 
    MatToolbarModule, 
    MatIconModule, 
    MatButtonModule, 
    MatSidenavModule, 
    MatListModule,
    RouterLinkActive
  ]
})
export class PageSettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly firestore = inject(AngularFirestore)

  protected settings$ = this.authService.user$.pipe(
    switchMap(user => this.firestore.doc('/users/' + user?.uid).get()),    
    tap(console.log)
  )
}