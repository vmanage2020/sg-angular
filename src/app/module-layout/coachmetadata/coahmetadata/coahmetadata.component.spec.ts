import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoahmetadataComponent } from './coahmetadata.component';

describe('CoahmetadataComponent', () => {
  let component: CoahmetadataComponent;
  let fixture: ComponentFixture<CoahmetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoahmetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoahmetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
