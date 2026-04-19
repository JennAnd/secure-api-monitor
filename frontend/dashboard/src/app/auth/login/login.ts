// This component handles user login and sends credentials
// to the backend authentication endpoint

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  // Bound to the form inputs
  username = '';
  password = '';

  // Controls whether the password is visible or hidden
  showPassword = false;

  // Simple UI state flags
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['registered'] === 'true') {
        this.successMessage = 'Your account has been created. Please log in.';
      }

      if (params['sessionExpired'] === 'true') {
        this.errorMessage = 'Your session has expired. Please log in again.';
      }
    });
  }

  // Called when the user presses the login button
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        // After successful login, navigate to the main dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error ?? 'Login failed. Please check your credentials.';
        this.cdr.detectChanges();
      },
    });
  }

  // Called when the user wants to go to the register page
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
