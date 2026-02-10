import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class SidebarComponent {
  @Input() open = false;

  // Tell parent layout that a navigation happened
  @Output() navigate = new EventEmitter<void>();

  constructor(public router: Router) {}

  onNavigate() {
    this.navigate.emit();
  }
}
