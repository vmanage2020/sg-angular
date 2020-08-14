import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerfieldEditComponent } from './playerfield-edit.component';

describe('PlayerfieldEditComponent', () => {
  let component: PlayerfieldEditComponent;
  let fixture: ComponentFixture<PlayerfieldEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerfieldEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerfieldEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
