import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsEditComponent } from './organizations-edit.component';

describe('OrganizationsEditComponent', () => {
  let component: OrganizationsEditComponent;
  let fixture: ComponentFixture<OrganizationsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
