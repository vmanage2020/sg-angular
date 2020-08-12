import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(  private route: ActivatedRoute, private router: Router){

  }
  ngOnInit() {
    window.addEventListener('storage', (event) => {
      if (event.storageArea == localStorage) {
        let token = localStorage.getItem('token');
        if(!token) { // you can update this as per your key
            // DO LOGOUT FROM THIS TAB AS WELL
            this.router.navigate(['/account/login']); // If you are using router
           
        }
      }
    }, false);
  }
}
