import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamListCreateComponent } from './team-list-create.component';

describe('TeamListCreateComponent', () => {
  let component: TeamListCreateComponent;
  let fixture: ComponentFixture<TeamListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
