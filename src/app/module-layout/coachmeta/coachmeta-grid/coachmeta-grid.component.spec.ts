import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachmetaGridComponent } from './coachmeta-grid.component';

describe('CoachmetaGridComponent', () => {
  let component: CoachmetaGridComponent;
  let fixture: ComponentFixture<CoachmetaGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachmetaGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachmetaGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
