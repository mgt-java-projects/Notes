import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressBarService {
  private totalPages = 0;

  private currentPageSubject = new BehaviorSubject<number>(0);
  private showLabelSubject = new BehaviorSubject<boolean>(false);
  private labelSubject = new BehaviorSubject<string>('');

  /**
   * Observable to get the current page value.
   */
  get currentPage$(): Observable<number> {
    return this.currentPageSubject.asObservable();
  }

  /**
   * Observable to get the display state of the label.
   */
  get showLabel$(): Observable<boolean> {
    return this.showLabelSubject.asObservable();
  }

  /**
   * Observable to get the label text.
   */
  get label$(): Observable<string> {
    return this.labelSubject.asObservable();
  }

  /**
   * Sets the total number of pages for the progress bar.
   * @param pages Total number of pages.
   */
  setTotalPages(pages: number): void {
    this.totalPages = pages;
  }

  /**
   * Sets the current page to the given value.
   * @param page The page to set as the current page.
   */
  setCurrentPage(page: number): void {
    if (page > this.totalPages) {
      throw new Error(`Current page (${page}) cannot be greater than total pages (${this.totalPages}).`);
    }
    this.currentPageSubject.next(page);
  }

  /**
   * Updates the display state of the label.
   * @param show Whether to display the label.
   */
  setShowLabel(show: boolean): void {
    this.showLabelSubject.next(show);
  }

  /**
   * Updates the label text.
   * @param label The text to display as the label.
   */
  setLabel(label: string): void {
    this.labelSubject.next(label);
  }

  /**
   * Resets the progress bar to its default state.
   * - Sets the current page to 0.
   * - Clears the label and hides it.
   */
  reset(): void {
    this.setCurrentPage(0);
    this.setLabel('');
    this.setShowLabel(false);
  }

  /**
   * Increments the current page with flexible behavior:
   * - No arguments: Increment current page by 1, reset label to '', and hide the label.
   * - One argument (string): Increment current page by 1, set label to the given value, and show the label.
   * - One argument (number): Set the current page to the given value, reset label to '', and hide the label.
   * - Two arguments (number, string): Set the current page to the given value, set the label to the given value, and show the label.
   * @param currentPage Optional: The page to set or increment.
   * @param newLabel Optional: The label text to display.
   */
  incrementCurrentPage(currentPage?: number, newLabel?: string): void {
    if (currentPage !== undefined && newLabel !== undefined) {
      // Set current page and label
      this.setCurrentPage(currentPage);
      this.setLabel(newLabel);
      this.setShowLabel(true);
    } else if (currentPage !== undefined) {
      // Set current page only
      this.setCurrentPage(currentPage);
      this.setLabel('');
      this.setShowLabel(false);
    } else if (newLabel !== undefined) {
      // Increment current page and set label
      const incrementedPage = this.currentPageSubject.value + 1;
      if (incrementedPage > this.totalPages) {
        throw new Error(`Incremented page (${incrementedPage}) exceeds total pages (${this.totalPages}).`);
      }
      this.setCurrentPage(incrementedPage);
      this.setLabel(newLabel);
      this.setShowLabel(true);
    } else {
      // Increment current page only
      const incrementedPage = this.currentPageSubject.value + 1;
      if (incrementedPage > this.totalPages) {
        throw new Error(`Incremented page (${incrementedPage}) exceeds total pages (${this.totalPages}).`);
      }
      this.setCurrentPage(incrementedPage);
      this.setLabel('');
      this.setShowLabel(false);
    }
  }
}
