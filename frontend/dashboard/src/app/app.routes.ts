import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './auth/auth.guard';
import { Logs } from './pages/logs/logs';
import { Overview } from './pages/overview/overview';
import { ErrorStats } from './pages/error-stats/error-stats';
import { SecurityEvents } from './pages/security-events/security-events';
import { Settings } from './pages/settings/settings';

// All routes for the application
export const routes: Routes = [
  // Show login page when user goes to /login
  { path: 'login', component: LoginComponent },

  // Show the register page when user goes to /register
  { path: 'register', component: RegisterComponent },

  // Main dashboard page
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        component: Overview,
      },
      { path: 'logs', component: Logs },
      { path: 'errors', component: ErrorStats },
      { path: 'security', component: SecurityEvents },
      { path: 'settings', component: Settings },
    ],
  },

  // Redirect the root URL to /login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // If user goes to any unknown route, send to login
  { path: '**', redirectTo: 'login' },
];
