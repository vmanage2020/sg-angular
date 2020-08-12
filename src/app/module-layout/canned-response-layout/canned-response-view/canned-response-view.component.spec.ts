import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseViewComponent } from './canned-response-view.component';

describe('CannedResponseViewComponent', () => {
  let component: CannedResponseViewComponent;
  let fixture: ComponentFixture<CannedResponseViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
