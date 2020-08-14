import { Component, OnInit, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-ui-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit {

  @Input() display = false;
  @Input() landingPage = false;
  // @Input() loaderWithLogo = false;
  private eventsSubscription: Subscription;

  @Input() loaderInfo: Observable<String>;
  progress: any = '0';
  loaderStatus: any = '';
  displaylogo:any=false;
  constructor() { }

  ngOnInit() {
    if (this.loaderInfo) {
      this.eventsSubscription = this.loaderInfo.subscribe((data: any) => {
        // console.log(data);
        this.progress = data.progressBarLoading;
        this.loaderStatus = data.statusOfProgress;
        if(data.displayLogo){
          this.displaylogo=true;
        }else{
          this.displaylogo=false;
        }
      });
    }
  }

  ngOnDestroy() {
    // this.eventsSubscription.unsubscribe();
  }
  /**
   * Shows the loader
   */
  show() {
    this.display = true;
  }

  /**
   * Hides the loader
   */
  hide() {
    this.display = false;
  }

}
