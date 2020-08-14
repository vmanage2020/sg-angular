import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachmetaComponent } from './coachmeta.component';

describe('CoachmetaComponent', () => {
  let component: CoachmetaComponent;
  let fixture: ComponentFixture<CoachmetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachmetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachmetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
