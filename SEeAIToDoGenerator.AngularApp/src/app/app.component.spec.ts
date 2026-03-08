import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const authServiceStub = {
    isLoginRequired: false,
    isLoggedIn: false,
    user: undefined,
    logout: jasmine.createSpy('logout')
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  const langChange = new Subject<{ lang: string }>();
  const translateServiceStub = {
    currentLang: 'de',
    onLangChange: langChange,
    use: jasmine.createSpy('use').and.returnValue(of('de'))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: TranslateService, useValue: translateServiceStub }
      ]
    }).compileComponents();

    TestBed.overrideComponent(AppComponent, {
      set: { template: '' }
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'SEeAIToDoGenerator'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('SEeAIToDoGenerator');
  });
});
