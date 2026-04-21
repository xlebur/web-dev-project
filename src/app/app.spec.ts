import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router'; // Required if you use <router-outlet>

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]), // Add this to prevent 'router-outlet' errors
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'typeracer-project'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    // Note: Ensure your AppComponent has: title = 'typeracer-project';
    expect(app.title).toEqual('typeracer-project');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Trigger change detection to render HTML
    const compiled = fixture.nativeElement as HTMLElement;

    // Adjust the selector (h1, span, etc.) to match your actual HTML template
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, typeracer-project');
  });
});
