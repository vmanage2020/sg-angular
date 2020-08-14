import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelGridComponent } from './level-grid.component';

describe('LevelGridComponent', () => {
  let component: LevelGridComponent;
  let fixture: ComponentFixture<LevelGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
