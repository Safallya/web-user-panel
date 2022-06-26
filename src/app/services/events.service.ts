import { Injectable } from '@angular/core';
import { User } from 'app/utils/types';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  currentUser: User | null;

  constructor() { }
}
