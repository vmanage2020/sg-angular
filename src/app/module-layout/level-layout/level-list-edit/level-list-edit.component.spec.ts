import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelListEditComponent } from './level-list-edit.component';

describe('LevelListEditComponent', () => {
  let component: LevelListEditComponent;
  let fixture: ComponentFixture<LevelListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
