import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelListCreateComponent } from './level-list-create.component';

describe('LevelListCreateComponent', () => {
  let component: LevelListCreateComponent;
  let fixture: ComponentFixture<LevelListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
