import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayermetaComponent } from './playermeta.component';

describe('PlayermetaComponent', () => {
  let component: PlayermetaComponent;
  let fixture: ComponentFixture<PlayermetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayermetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayermetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
