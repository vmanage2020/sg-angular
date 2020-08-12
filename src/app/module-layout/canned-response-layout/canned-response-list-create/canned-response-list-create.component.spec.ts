import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseListCreateComponent } from './canned-response-list-create.component';

describe('CannedResponseListCreateComponent', () => {
  let component: CannedResponseListCreateComponent;
  let fixture: ComponentFixture<CannedResponseListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
