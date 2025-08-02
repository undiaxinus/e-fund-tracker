import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import 'iconify-icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent {
  currentYear = new Date().getFullYear();

  navigateToEFund() {
    // Navigate to E-Fund Tracker login
    window.location.href = '/login';
  }

  navigateToCollection() {
    // Navigate to Collection system (placeholder for now)
    alert('Collection system will be available soon!');
  }
}