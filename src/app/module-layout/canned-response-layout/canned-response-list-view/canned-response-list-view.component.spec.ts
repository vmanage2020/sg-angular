import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseListViewComponent } from './canned-response-list-view.component';

describe('CannedResponseListViewComponent', () => {
  let component: CannedResponseListViewComponent;
  let fixture: ComponentFixture<CannedResponseListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
