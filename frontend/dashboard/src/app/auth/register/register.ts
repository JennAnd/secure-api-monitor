import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  // Bound to the form inputs
  username = '';
  password = '';

  // UI state flags
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Called when the user presses the create account button
  onRegister(): void {
    this.errorMessage = '';

    // Check that both fields are filled
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.isLoading = true;

    // Call backend /auth/register endpoint
    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        // After successful registration, navigate back to the login page
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error ?? 'Registration failed. Please check your input.';
      },
    });
  }

  // Called when the user wants to go back to the login page
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
