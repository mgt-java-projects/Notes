import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { LayoutNavigationService } from '../services/layout-navigation.service';
import { LayoutActionsEnum } from '../enums/layout-actions.enum';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let layoutNavigationService: jest.Mocked<LayoutNavigationService>;

  beforeEach(() => {
    const mockLayoutNavigationService = {
      triggerLayoutAction: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: LayoutNavigationService, useValue: mockLayoutNavigationService },
      ],
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    layoutNavigationService = TestBed.inject(
      LayoutNavigationService
    ) as jest.Mocked<LayoutNavigationService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger the BACK action when clickBack is called', () => {
    component.clickBack();
    expect(layoutNavigationService.triggerLayoutAction).toHaveBeenCalledWith(
      LayoutActionsEnum.BACK
    );
  });

  it('should not trigger any action when clickTertiary is called (if not implemented)', () => {
    component.clickTertiary();
    expect(layoutNavigationService.triggerLayoutAction).not.toHaveBeenCalled();
  });

  it('should not trigger any action when clickClose is called (if not implemented)', () => {
    component.clickClose();
    expect(layoutNavigationService.triggerLayoutAction).not.toHaveBeenCalled();
  });
});
