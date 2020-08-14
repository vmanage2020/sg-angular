import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayermetaCreateComponent } from './playermeta-create.component';

describe('PlayermetaCreateComponent', () => {
  let component: PlayermetaCreateComponent;
  let fixture: ComponentFixture<PlayermetaCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayermetaCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayermetaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
