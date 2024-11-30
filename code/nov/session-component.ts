import { Component, OnDestroy } from '@angular/core';
import { RefreshSessionTokenService } from './refresh-session-token.service';
import { UserActivityService } from './user-activity.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-session-handler',
  templateUrl: './session-handler.component.html',
  styleUrls: ['./session-handler.component.css']
})
export class SessionHandlerComponent implements OnDestroy {
  private userActivitySubscription: Subscription;
  private sessionWarningSubscription: Subscription;
  private sessionTimeoutSubscription: Subscription;

  isWarningVisible = false;
  isSessionExpired = false;

  constructor(
    private refreshSessionTokenService: RefreshSessionTokenService,
    private userActivityService: UserActivityService
  ) {
    // Track user activity
    this.userActivitySubscription = this.userActivityService.onActivityDetected.subscribe(() => {
      this.refreshSessionTokenService.startRefreshTokenLogic();
      this.isWarningVisible = false;
      this.isSessionExpired = false;
    });

    // Show session warning
    this.sessionWarningSubscription = this.userActivityService.onSessionWarning.subscribe(() => {
      this.isWarningVisible = true;
    });

    // Handle session timeout
    this.sessionTimeoutSubscription = this.userActivityService.onSessionTimeout.subscribe(() => {
      this.isWarningVisible = false;
      this.isSessionExpired = true;
      this.refreshSessionTokenService.stopRefreshTokenLogic();
    });
  }

  continueSession(): void {
    this.isWarningVisible = false;
    this.refreshSessionTokenService.startRefreshTokenLogic();
  }

  ngOnDestroy(): void {
    this.userActivitySubscription.unsubscribe();
    this.sessionWarningSubscription.unsubscribe();
    this.sessionTimeoutSubscription.unsubscribe();
  }
}
-------------
<div *ngIf="isWarningVisible" class="warning-modal">
  <p>Your session is about to expire. Click "Continue" to keep using the app.</p>
  <button (click)="continueSession()">Continue</button>
</div>

<div *ngIf="isSessionExpired" class="expired-modal">
  <p>Your session has timed out.</p>
</div>