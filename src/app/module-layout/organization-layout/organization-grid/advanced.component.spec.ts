import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationGridComponent } from './organization-grid.component';

describe('OrganizationGridComponent', () => {
  let component: OrganizationGridComponent;
  let fixture: ComponentFixture<OrganizationGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
