import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseGridComponent } from './canned-response-grid.component';

describe('CannedResponseGridComponent', () => {
  let component: CannedResponseGridComponent;
  let fixture: ComponentFixture<CannedResponseGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
