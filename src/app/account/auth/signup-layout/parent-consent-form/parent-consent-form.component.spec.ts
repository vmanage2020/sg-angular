import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentConsentFormComponent } from './parent-consent-form.component';

describe('ParentConsentFormComponent', () => {
  let component: ParentConsentFormComponent;
  let fixture: ComponentFixture<ParentConsentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParentConsentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentConsentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
