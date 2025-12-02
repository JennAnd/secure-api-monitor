import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Base URL for .NET backend API
  private readonly apiBaseUrl = 'http://localhost:5062/api';

  // Key used to store the JWT token in localStorage
  private readonly tokenKey = 'secure_api_monitor_token';

  constructor(private http: HttpClient) {}

  // Call backend /auth/login endpoint and store JWT token on success
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          this.saveToken(response.token);
        })
      );
  }

  // Save token in browser storage
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get the stored token or null if none exists
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // User is "logged in" if a token exists
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Remove token and "log out" user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
