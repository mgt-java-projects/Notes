<div class="page-container">
  <div [class]="animationClass + ' router-page'" *ngIf="isAnimating"></div>
  <router-outlet></router-outlet>
</div>

-------
.page-container {
    position: relative;
    perspective: 1500px;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .router-page {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transform-origin: left;
    transform: rotateY(0deg);
    transition: transform 1s ease-in-out;
  }
  
  .router-page-enter {
    transform: rotateY(-180deg);
  }
  
  .router-page-enter-active {
    transform: rotateY(0deg);
  }
  
  .router-page-leave {
    transform: rotateY(0deg);
  }
  
  .router-page-leave-active {
    transform: rotateY(180deg);
  }

  
  -------
  import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  isAnimating = false;
  animationClass = '';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isAnimating = true;
        this.animationClass = 'router-page-leave';
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.isAnimating = false;
          this.animationClass = 'router-page-enter';
        }, 1000); // Match the animation duration
      }
    });
  }
}
