import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayermetaGridComponent } from './playermeta-grid.component';

describe('PlayermetaGridComponent', () => {
  let component: PlayermetaGridComponent;
  let fixture: ComponentFixture<PlayermetaGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayermetaGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayermetaGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
