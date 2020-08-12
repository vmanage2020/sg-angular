import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterationFailedComponent } from './registeration-failed.component';

describe('RegisterationFailedComponent', () => {
  let component: RegisterationFailedComponent;
  let fixture: ComponentFixture<RegisterationFailedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterationFailedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterationFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
