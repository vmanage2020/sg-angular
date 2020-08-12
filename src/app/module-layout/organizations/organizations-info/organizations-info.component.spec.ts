import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsInfoComponent } from './organizations-info.component';

describe('OrganizationsInfoComponent', () => {
  let component: OrganizationsInfoComponent;
  let fixture: ComponentFixture<OrganizationsInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationsInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
