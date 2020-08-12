import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamListEditComponent } from './team-list-edit.component';

describe('TeamListEditComponent', () => {
  let component: TeamListEditComponent;
  let fixture: ComponentFixture<TeamListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
