import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  currentTime = this.formatCurrentTime();
  private timeSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Update time every minute
    this.timeSubscription = interval(60000).subscribe(() => {
      this.currentTime = this.formatCurrentTime();
    });
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
  }

  /**
   * Navigate to E-Fund Tracker system with improved UX
   */
  navigateToEFund(): void {
    try {
      // Use Angular Router for better navigation
      this.router.navigate(['/login']).catch(() => {
        // Fallback to window.location if route doesn't exist
        window.location.href = '/login';
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = '/login';
    }
  }

  /**
   * Navigate to Collection system (placeholder)
   */
  navigateToCollection(): void {
    // Enhanced notification for coming soon feature
    const message = `🚧 Collection System - Coming Soon!\n\n` +
                   `We're working hard to bring you the Collection System.\n` +
                   `Expected release: Q2 2024\n\n` +
                   `Features will include:\n` +
                   `• Payment Tracking\n` +
                   `• Revenue Monitoring\n` +
                   `• Collection Reports\n` +
                   `• Receipt Management`;
    
    alert(message);
  }

  /**
   * Get current time formatted for display
   */
  getCurrentTime(): string {
    return this.currentTime;
  }

  /**
   * Format current time as readable string
   */
  private formatCurrentTime(): string {
    const now = new Date();
    return now.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}