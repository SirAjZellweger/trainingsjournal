import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-list-settings',
  templateUrl: './list-settings.component.html',
  styleUrls: ['./list-settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    RouterLink, 
  ]
})
export class ListSettingsComponent {
}