  // Default values for personalInfoConfig and personalInfoForm
  component.personalInfoConfig = { firstname: 'John', lastname: 'Doe' };
  component.personalInfoForm = { value: { name: { first: 'John', last: 'Doe' } } };
});

/** Test for checkDedupe() **/
it('should set showDedupeModal to true when names match', () => {
  component.checkDedupe();
  expect(component.showDedupeModal).toBe(true);
  expect(mockNavigationService.navigateNext).not.toHaveBeenCalled();
});

it('should call navigateNext when names do not match', () => {
  component.personalInfoForm.value.name.first = 'Jane'; // Change name
  component.checkDedupe();
  expect(component.showDedupeModal).toBe(false);
  expect(mockNavigationService.navigateNext).toHaveBeenCalled();
});

/** Test for closeDedupeModal() **/
it('should set showDedupeModal to false', () => {
  component.showDedupeModal = true;
  component.closeDedupeModal();
  expect(component.showDedupeModal).toBe(false);
});

/** Test for dedupeRouteLSSO() **/
it('should navigate with the correct queryParams', () => {
  component.dedupeRouteLASSO();
  expect(mockRouter.navigate).toHaveBeenCalledWith(['/'], {
    queryParams: { '': 'Y', 'lang': 'en' },
  });
});
});