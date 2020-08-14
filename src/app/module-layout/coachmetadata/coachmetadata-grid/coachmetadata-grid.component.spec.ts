import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachmetadataGridComponent } from './coachmetadata-grid.component';

describe('CoachmetadataGridComponent', () => {
  let component: CoachmetadataGridComponent;
  let fixture: ComponentFixture<CoachmetadataGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachmetadataGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachmetadataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
