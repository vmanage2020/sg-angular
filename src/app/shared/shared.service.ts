import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  // Observable string sources
  private missionAnnouncedSource = new BehaviorSubject<string>('Initial');

   // Observable string streams
   missionAnnounced$ = this.missionAnnouncedSource.asObservable();
  constructor() { }

  // Service message commands
  announceMission(mission: any) {
    this.missionAnnouncedSource.next(mission);
  }


  private subject = new Subject<any>();

  sendData(data: any) {
    this.subject.next(data);
  }

  clearData() {
    this.subject.next();
  }

  getData(): Observable<any> {
    return this.subject.asObservable();
  }
}
