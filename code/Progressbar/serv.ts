import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressBarService {
  private totalPages = 0;
  private currentPage = 0; // Current page is a simple number, only update with set method.

  private showLabelSubject = new BehaviorSubject<boolean>(false);
  private labelSubject = new BehaviorSubject<string>('');
  private showPercentageLabelSubject = new BehaviorSubject<boolean>(false);
  private percentageValueSubject = new BehaviorSubject<number>(0);

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
   * Observable to get the display state of the percentage label.
   */
  get showPercentageLabel$(): Observable<boolean> {
    return this.showPercentageLabelSubject.asObservable();
  }

  /**
   * Observable to get the progress percentage value.
   */
  get percentageValue$(): Observable<number> {
    return this.percentageValueSubject.asObservable();
  }

  /**
   * Initializes the progress bar with current page, total pages, and whether to show percentage.
   * @param currentPage The current page to initialize.
   * @param totalPages The total number of pages.
   * @param showPercentage Whether to show the percentage label.
   */
  init(currentPage: number, totalPages: number, showPercentage: boolean): void {
    this.totalPages = totalPages;
    this.setShowPercentageLabel(showPercentage);
    this.setCurrentPage(currentPage); // Ensure percentage is updated
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
   * Updates the display state of the percentage label.
   * @param show Whether to display the percentage label.
   */
  setShowPercentageLabel(show: boolean): void {
    this.showPercentageLabelSubject.next(show);
  }

  /**
   * Resets the progress bar to its default state.
   * - Sets the current page to 0.
   * - Clears the label and hides it.
   * - Clears the percentage value.
   */
  reset(): void {
    this.setLabel('');
    this.setShowLabel(false);
    this.setShowPercentageLabel(false);
    this.setCurrentPage(0); // Reset the percentage
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
      const incrementedPage = this.currentPage + 1;
      if (incrementedPage > this.totalPages) {
        throw new Error(`Incremented page (${incrementedPage}) exceeds total pages (${this.totalPages}).`);
      }
      this.setCurrentPage(incrementedPage);
      this.setLabel(newLabel);
      this.setShowLabel(true);
    } else {
      // Increment current page only
      const incrementedPage = this.currentPage + 1;
      if (incrementedPage > this.totalPages) {
        throw new Error(`Incremented page (${incrementedPage}) exceeds total pages (${this.totalPages}).`);
      }
      this.setCurrentPage(incrementedPage);
      this.setLabel('');
      this.setShowLabel(false);
    }
  }

  /**
   * Sets the current page to the given value (private).
   * Updates the progress percentage value.
   * @param page The page to set as the current page.
   */
  private setCurrentPage(page: number): void {
    if (page > this.totalPages) {
      throw new Error(`Current page (${page}) cannot be greater than total pages (${this.totalPages}).`);
    }
    this.currentPage = page;
    this.updatePercentageValue(); // Update percentage whenever the current page changes only
  }

  /**
   * Calculates and updates the percentage value based on the current page and total pages.
   */
  private updatePercentageValue(): void {
    const percentage = this.totalPages > 0 ? Math.round((this.currentPage / this.totalPages) * 100) : 0;
    this.percentageValueSubject.next(percentage);
  }
}
