import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsCreateComponent } from './organizations-create.component';

describe('OrganizationsCreateComponent', () => {
  let component: OrganizationsCreateComponent;
  let fixture: ComponentFixture<OrganizationsCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationsCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
