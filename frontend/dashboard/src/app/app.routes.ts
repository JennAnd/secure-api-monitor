import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './auth/auth.guard';

// All routes for the application
export const routes: Routes = [
  // Show login page when user goes to /login
  { path: 'login', component: LoginComponent },

  // Show the register page when user goes to /register
  { path: 'register', component: RegisterComponent },

  // Main dashboard page
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  // Redirect the root URL to /login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // If user goes to any unknown route, send to login
  { path: '**', redirectTo: 'login' },
];
