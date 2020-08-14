import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonListEditComponent } from './season-list-edit.component';

describe('SeasonListEditComponent', () => {
  let component: SeasonListEditComponent;
  let fixture: ComponentFixture<SeasonListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
