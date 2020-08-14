import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelListViewComponent } from './level-list-view.component';

describe('LevelListViewComponent', () => {
  let component: LevelListViewComponent;
  let fixture: ComponentFixture<LevelListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
