import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagercustomfieldEditComponent } from './managercustomfield-edit.component';

describe('ManagercustomfieldEditComponent', () => {
  let component: ManagercustomfieldEditComponent;
  let fixture: ComponentFixture<ManagercustomfieldEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagercustomfieldEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagercustomfieldEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
