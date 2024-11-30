import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private activityTimeout: any;
  private warningTimeout: any;
  private sessionTimeout: any;

  public onActivityDetected = new Subject<void>();
  public onSessionWarning = new Subject<void>();
  public onSessionTimeout = new Subject<void>();

  private activityThreshold = 11 * 60 * 1000; // 11 minutes
  private warningThreshold = 9 * 60 * 1000;  // 9 minutes (after warning)

  constructor() {
    this.setupActivityListeners();
  }

  /**
   * Setup event listeners for user activity.
   */
  private setupActivityListeners(): void {
    ['click', 'mousemove', 'keydown', 'touchstart'].forEach(event => {
      window.addEventListener(event, () => this.resetActivityTimer());
    });
  }

  /**
   * Reset the activity timer and notify observers.
   */
  private resetActivityTimer(): void {
    clearTimeout(this.activityTimeout);
    clearTimeout(this.warningTimeout);
    clearTimeout(this.sessionTimeout);

    this.onActivityDetected.next();

    // Start the activity timer
    this.activityTimeout = setTimeout(() => {
      this.showSessionWarning();
    }, this.activityThreshold);
  }

  /**
   * Show session warning and start expiry countdown.
   */
  private showSessionWarning(): void {
    this.onSessionWarning.next();

    // Start the warning timeout
    this.warningTimeout = setTimeout(() => {
      this.triggerSessionTimeout();
    }, this.warningThreshold);
  }

  /**
   * Trigger session timeout.
   */
  private triggerSessionTimeout(): void {
    this.onSessionTimeout.next();
  }
}
