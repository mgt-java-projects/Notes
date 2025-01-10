// Action to update partial contact info
export const updateContactInfo = createAction(
    '[Contact] Update Contact Info',
    props<{ phone?: string }>() // Partial update for phone
  );


   // Handle updating partial contact info (only phone in this case)
   on(updateContactInfo, (state, { phone }) => ({
    ...state,
    ...(phone ? { phone } : {}), // Update only if phone is provided
  }))


  updatePhone() {
    this.store.dispatch(updateContactInfo({ phone: '0987654321' }));
  }