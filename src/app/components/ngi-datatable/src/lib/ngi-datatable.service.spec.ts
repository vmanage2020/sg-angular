import { TestBed } from '@angular/core/testing';

import { NgiDatatableService } from './ngi-datatable.service';

describe('NgiDatatableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgiDatatableService = TestBed.get(NgiDatatableService);
    expect(service).toBeTruthy();
  });
});
