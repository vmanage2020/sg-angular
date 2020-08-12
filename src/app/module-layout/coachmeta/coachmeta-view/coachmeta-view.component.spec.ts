import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachmetaViewComponent } from './coachmeta-view.component';

describe('CoachmetaViewComponent', () => {
  let component: CoachmetaViewComponent;
  let fixture: ComponentFixture<CoachmetaViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachmetaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachmetaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
