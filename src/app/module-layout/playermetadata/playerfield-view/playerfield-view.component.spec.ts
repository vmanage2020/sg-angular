import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerfieldViewComponent } from './playerfield-view.component';

describe('PlayerfieldViewComponent', () => {
  let component: PlayerfieldViewComponent;
  let fixture: ComponentFixture<PlayerfieldViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerfieldViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerfieldViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
