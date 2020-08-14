import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayermetaEditComponent } from './playermeta-edit.component';

describe('PlayermetaEditComponent', () => {
  let component: PlayermetaEditComponent;
  let fixture: ComponentFixture<PlayermetaEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayermetaEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayermetaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
