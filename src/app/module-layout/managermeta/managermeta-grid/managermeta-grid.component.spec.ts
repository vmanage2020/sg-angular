import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagermetaGridComponent } from './managermeta-grid.component';

describe('ManagermetaGridComponent', () => {
  let component: ManagermetaGridComponent;
  let fixture: ComponentFixture<ManagermetaGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagermetaGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagermetaGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
