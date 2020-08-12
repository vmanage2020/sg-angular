import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseListComponent } from './canned-response-list.component';

describe('CannedResponseListComponent', () => {
  let component: CannedResponseListComponent;
  let fixture: ComponentFixture<CannedResponseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
