import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagercustomfieldViewComponent } from './managercustomfield-view.component';

describe('ManagercustomfieldViewComponent', () => {
  let component: ManagercustomfieldViewComponent;
  let fixture: ComponentFixture<ManagercustomfieldViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagercustomfieldViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagercustomfieldViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
