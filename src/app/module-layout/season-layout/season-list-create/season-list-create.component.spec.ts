import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonListCreateComponent } from './season-list-create.component';

describe('SeasonListCreateComponent', () => {
  let component: SeasonListCreateComponent;
  let fixture: ComponentFixture<SeasonListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
