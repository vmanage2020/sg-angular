import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationLayoutComponent } from './organization-layout.component';

describe('OrganizationLayoutComponent', () => {
  let component: OrganizationLayoutComponent;
  let fixture: ComponentFixture<OrganizationLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
