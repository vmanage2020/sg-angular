import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagercustomfieldGridComponent } from './managercustomfield-grid.component';

describe('ManagercustomfieldGridComponent', () => {
  let component: ManagercustomfieldGridComponent;
  let fixture: ComponentFixture<ManagercustomfieldGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagercustomfieldGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagercustomfieldGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
