import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagermetaEditComponent } from './managermeta-edit.component';

describe('ManagermetaEditComponent', () => {
  let component: ManagermetaEditComponent;
  let fixture: ComponentFixture<ManagermetaEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagermetaEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagermetaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
