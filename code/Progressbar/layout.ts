percentage = 0;
showLabel = false;
label = '';

constructor(private progressBarService: ProgressBarService) {}

ngOnInit(): void {
  // Subscribe to progress bar service observables
  this.progressBarService.currentPage$.subscribe((currentPage) => {
    this.percentage = this.progressBarService.getProgressValue();
  });

  this.progressBarService.showLabel$.subscribe((showLabel) => {
    this.showLabel = showLabel;
  });

  this.progressBarService.label$.subscribe((label) => {
    this.label = label;
  });
}