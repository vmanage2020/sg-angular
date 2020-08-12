import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupChildComponent } from './signup-child.component';

describe('SignupChildComponent', () => {
  let component: SignupChildComponent;
  let fixture: ComponentFixture<SignupChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
