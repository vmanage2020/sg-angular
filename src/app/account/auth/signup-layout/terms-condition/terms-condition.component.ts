import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { ThrowStmt } from '@angular/compiler';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { apiURL } from '../../../../core/services/config'
import { AuthenticationService } from 'src/app/core/services/auth.service';
@Component({
  selector: 'app-terms-condition',
  templateUrl: './terms-condition.component.html',
  styleUrls: ['./terms-condition.component.scss']
})
export class TermsConditionComponent implements OnInit {

  @Input('signupInfo') signupInfo: any = {};

  @Input('childInfo') childInfo: any = {};


  loading = false;
  termsConditionForm: FormGroup;
  //   is_condition_applied:''
  // };
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService, public authService: AuthenticationService) { }

  ngOnInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
    this.termsConditionForm = this.formBuilder.group({

      is_condition_applied: [true, [Validators.required]],

    });
    // console.log(this.signupInfo)

  }
  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
  }

  isConditionApplied(event) {
    console.log(event.target.value)
    this.signupInfo['is_condition_applied'] = event.target.value
  }
  isConditionNotApplied(event) {
    console.log(event.target.value)
    this.signupInfo['is_condition_applied'] = event.target.value
  }
  openModal(content: string) {
    this.modalService.open(content, { centered: true });
  }
  onSubmit(form) {
    this.loading = true;
    this.signupInfo['is_condition_applied']=form.value.is_condition_applied
     console.log(this.signupInfo)
    this.authService.postData(apiURL.SIGN_UP_USER, this.signupInfo).subscribe(res => {
      try {
        if (res) {
          this.loading = false;
          this.router.navigate(['/account/auth/confirm-signup'])
        }
      }
      catch (error) {
        console.log(error)
      }

    })
 }
 declineForm(){
  this.modalService.dismissAll();
  this.router.navigate(['/account/auth/registrationfailed'])
 }
//  New Changes done by nishanthi
aTagPrivacyPolicy(event){    
  let tagEventId:any = document.getElementById('tagColorPrivacyPolicy');    
  if(tagEventId.classList) {
    if(!tagEventId.classList.contains('visited')) {
      tagEventId.classList.add('visited'); // Add class
    }
  }    
}
aTagChildPrivacyPolicy(event){
  let tagEventId:any = document.getElementById('tagColorChildPrivacyPolicy');    
  if(tagEventId.classList) {
    if(!tagEventId.classList.contains('visited')) {
      tagEventId.classList.add('visited'); // Add class
    }
  }
}
}

