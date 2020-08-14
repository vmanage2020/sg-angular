import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagercustomfieldCreateComponent } from './managercustomfield-create.component';

describe('ManagercustomfieldCreateComponent', () => {
  let component: ManagercustomfieldCreateComponent;
  let fixture: ComponentFixture<ManagercustomfieldCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagercustomfieldCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagercustomfieldCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
