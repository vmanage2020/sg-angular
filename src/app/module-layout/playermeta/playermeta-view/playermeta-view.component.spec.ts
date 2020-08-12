import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayermetaViewComponent } from './playermeta-view.component';

describe('PlayermetaViewComponent', () => {
  let component: PlayermetaViewComponent;
  let fixture: ComponentFixture<PlayermetaViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayermetaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayermetaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
