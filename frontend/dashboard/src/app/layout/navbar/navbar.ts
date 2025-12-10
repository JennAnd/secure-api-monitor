import { Component, Output, EventEmitter } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  // Called when the user presses the logout button
  logout(): void {
    // Remove token from storage
    this.authService.logout();

    // Go back to the login page
    this.router.navigate(['/login']);
  }
}
