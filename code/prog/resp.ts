it('should subscribe to progressBarService.options$', () => {
    const mockOptions = {
      totalPages: 5,
      currentPage: 2,
      percentageValue: 40,
    };
    (MockProgressBarService.optionsSubject as BehaviorSubject<any>).next(mockOptions);
    fixture.detectChanges();

    expect(component.progressBarOptions).toEqual(mockOptions);
  });

  it('should subscribe to nextButtonDisplayState$', () => {
    const mockNextButtonState = {
      isLoading: true,
      loadingLabel: 'Processing...',
      innerProjectedText: 'Submit',
    };
    (MockResponsiveLayoutDisplayStateService.nextButtonDisplayStateSubject as BehaviorSubject<any>).next(
      mockNextButtonState
    );
    fixture.detectChanges();

    expect(component.nextButtonState).toEqual(mockNextButtonState);
  });

  it('should add "content-filled" class when scrollHeight exceeds clientHeight', () => {
    document.body.innerHTML = `
      <div id="pageArea" style="height: 500px;"></div>
      <div id="takeOverArea"></div>
    `;
    const pageArea = document.getElementById('pageArea')!;
    const takeOverArea = document.getElementById('takeOverArea')!;
    Object.defineProperty(pageArea, 'scrollHeight', { value: 600 });
    Object.defineProperty(pageArea, 'clientHeight', { value: 500 });

    component.adjustNextButton();

    expect(takeOverArea.classList.contains('content-filled')).toBe(true);
  });

  it('should trigger layout navigation when onClickAction is called', () => {
    const triggerLayoutActionSpy = jest.spyOn(MockNavigationService, 'navigateTo');
    component.onClickAction('NEXT');
    expect(triggerLayoutActionSpy).toHaveBeenCalledWith('NEXT');
  });