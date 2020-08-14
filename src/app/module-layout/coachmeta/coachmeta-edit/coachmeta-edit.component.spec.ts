import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachmetaEditComponent } from './coachmeta-edit.component';

describe('CoachmetaEditComponent', () => {
  let component: CoachmetaEditComponent;
  let fixture: ComponentFixture<CoachmetaEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachmetaEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachmetaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
