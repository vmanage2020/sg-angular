import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SportLayoutComponent } from './sport-layout.component';

describe('SportLayoutComponent', () => {
  let component: SportLayoutComponent;
  let fixture: ComponentFixture<SportLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SportLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
