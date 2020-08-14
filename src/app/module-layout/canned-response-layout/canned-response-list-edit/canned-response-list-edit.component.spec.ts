import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseListEditComponent } from './canned-response-list-edit.component';

describe('CannedResponseListEditComponent', () => {
  let component: CannedResponseListEditComponent;
  let fixture: ComponentFixture<CannedResponseListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
