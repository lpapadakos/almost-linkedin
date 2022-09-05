import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'AlmostLinkedIn';

  constructor(private route: ActivatedRoute) {
    // Scroll to anchor (Articles, Job Ads, e.t.c.)
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        setTimeout(() => {
          const targetElement = document.querySelector(
            "[id='" + fragment + "']"
          );
          if (!targetElement) {
            window.scrollTo(0, 0);
          } else {
            targetElement.scrollIntoView();
            window.scrollBy(0, -70); // to offset height of fixed navbar
          }
        }, 1000);
      }
    });
  }
}
