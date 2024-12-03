import { PersonalInfoConfig } from './personal-info.config';
import { Validators } from '@angular/forms';

describe('PersonalInfoConfig', () => {
    let config: PersonalInfoConfig;

    beforeEach(() => {
        config = new PersonalInfoConfig();
    });

    it('should be created', () => {
        expect(config).toBeTruthy();
    });

    it('should have required validator for firstNameValidators', () => {
        expect(config.firstNameValidators).toContain(Validators.required);
        expect(config.firstNameValidators.length).toBe(1);
    });

    it('should have no validators for middleNameValidators', () => {
        expect(config.middleNameValidators).toEqual([]);
        expect(config.middleNameValidators.length).toBe(0);
    });

    it('should have required validator for lastNameValidators', () => {
        expect(config.lastNameValidators).toContain(Validators.required);
        expect(config.lastNameValidators.length).toBe(1);
    });

    it('should have required validator for dobValidators', () => {
        expect(config.dobValidators).toContain(Validators.required);
        expect(config.dobValidators.length).toBe(1);
    });
});
