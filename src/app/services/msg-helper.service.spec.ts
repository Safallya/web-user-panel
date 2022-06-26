import { TestBed } from '@angular/core/testing';

import { MsgHelperService } from './msg-helper.service';

describe('MsgHelperService', () => {
  let service: MsgHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsgHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
