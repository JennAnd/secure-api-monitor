import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';

// All routes for the application
export const routes: Routes = [
  // Show login page when user goes to /login
  { path: 'login', component: LoginComponent },

  // Redirect the root URL to /login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // If user goes to any unknown route, send to login
  { path: '**', redirectTo: 'login' },
];
