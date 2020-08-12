import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachmetaCreateComponent } from './coachmeta-create.component';

describe('CoachmetaCreateComponent', () => {
  let component: CoachmetaCreateComponent;
  let fixture: ComponentFixture<CoachmetaCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachmetaCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachmetaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
