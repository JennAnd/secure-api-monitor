import { Component, signal, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavbarComponent } from './layout/navbar/navbar';
import { SidebarComponent } from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NavbarComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private router: Router) {
    // 🔥 NEW: Listen for route changes and update signal
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }

  // Holds the current route
  currentUrl = signal('');

  // Sidebar state
  isSidebarOpen = signal(false);

  // Uses currentUrl
  isDashboardRoute = computed(() => this.currentUrl().startsWith('/dashboard'));

  // Toggles sidebar
  toggleSidebar() {
    this.isSidebarOpen.update((open) => !open);
  }
}
