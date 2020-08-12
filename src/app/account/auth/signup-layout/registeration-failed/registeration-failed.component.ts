import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registeration-failed',
  templateUrl: './registeration-failed.component.html',
  styleUrls: ['./registeration-failed.component.scss']
})
export class RegisterationFailedComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
  }
}
