import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayermetadataComponent } from './playermetadata.component';

describe('PlayermetadataComponent', () => {
  let component: PlayermetadataComponent;
  let fixture: ComponentFixture<PlayermetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayermetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayermetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
