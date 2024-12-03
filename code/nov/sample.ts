import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-my-component',
  template: `
    <div [innerHTML]="translatedText"></div>
  `,
})
export class MyComponent {
  translatedText: string = '';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadTranslation();
  }

  loadTranslation(): void {
    // Fetch the translated "mytext" with the translated "link"
    this.translate
      .get('mytext', {
        link: `<a href="javascript:void(0)" class="clickable" (click)="handleClick()">` + this.translate.instant('link') + `</a>`,
      })
      .subscribe((translated: string) => {
        this.translatedText = translated;
      });
  }

  handleClick(): void {
    console.log('Link clicked!');
    // Add your logic here
  }
}


-------------
import { TestBed } from '@angular/core/testing';
import { MyComponent } from './my-component.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('MyComponent', () => {
  let component: MyComponent;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      imports: [TranslateModule.forRoot()], // Include TranslateModule for testing
      providers: [TranslateService],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load and render translated text with dynamic link', () => {
    // Mock TranslateService.get and TranslateService.instant
    jest.spyOn(translateService, 'get').mockReturnValue(
      of('hello my world <a href="javascript:void(0)" class="clickable" id="test-link">link</a>')
    );
    jest.spyOn(translateService, 'instant').mockReturnValue('link');

    // Trigger ngOnInit
    component.ngOnInit();

    // Assert the translatedText is correctly set
    expect(component.translatedText).toContain('hello my world');
    expect(component.translatedText).toContain('<a href="javascript:void(0)" class="clickable" id="test-link">link</a>');
  });

  it('should call handleClick when the link is clicked', () => {
    // Mock TranslateService.get and TranslateService.instant
    jest.spyOn(translateService, 'get').mockReturnValue(
      of('hello my world <a href="javascript:void(0)" class="clickable" id="test-link">link</a>')
    );
    jest.spyOn(translateService, 'instant').mockReturnValue('link');

    // Spy on handleClick
    const handleClickSpy = jest.spyOn(component, 'handleClick');

    // Trigger ngOnInit
    component.ngOnInit();

    // Simulate a click on the link by querying the dynamic HTML
    const htmlElement = document.createElement('div');
    htmlElement.innerHTML = component.translatedText;
    const link = htmlElement.querySelector('#test-link') as HTMLElement;

    // Simulate the click event
    link.click();

    // Assert the handleClick method was called
    expect(handleClickSpy).toHaveBeenCalled();
  });
});
