import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseUpdateComponent } from './canned-response-update.component';

describe('CannedResponseUpdateComponent', () => {
  let component: CannedResponseUpdateComponent;
  let fixture: ComponentFixture<CannedResponseUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
