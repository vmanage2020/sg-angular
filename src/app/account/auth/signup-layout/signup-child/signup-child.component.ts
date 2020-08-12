import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Constant } from 'src/app/core/services/config';
import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
declare var $: any;
declare var jQuery: any;
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-signup-child',
  templateUrl: './signup-child.component.html',
  styleUrls: ['./signup-child.component.scss']
})
export class SignupChildComponent implements OnInit {

  @Input('childInfo') userInfo: any = {};
  @Input('signupInfo') signupInfo: any = {};
  @ViewChild('wizardForm', { static: false }) wizard: BaseWizardComponent;
  showChild:boolean = true;
  showTermsCondition:boolean = false;
  showParentForm:boolean =false;
  signupChildForm: FormGroup;
  childBelowThiteen:any=[];
  submitted:boolean = false;
  ischildParentFormExist:any=[];
  emailValidation:boolean = false;
  isEmailValid :any = Constant.email_validation
  childDetails: any;
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.signupChildForm = this.formBuilder.group({
      children: this.formBuilder.array([this.kidsInfo(null,null)])
    });    
    this.childDetails = this.userInfo.children;
  }

  formSubmit(form) { 
    if (this.signupChildForm.valid) {
      this.wizard.navigation.goToNextStep();
    }
    this.submitted = true;  
  }
  openModal(content: string) {
    this.modalService.open(content, { centered: true });
  }



  isRequiredValid(event, signupChildForm, data, index) {
   
   if (event.target.checked) {
   (this.signupChildForm.get('children') as FormArray).at(index)['controls'].email.setValidators([Validators.pattern(this.isEmailValid), Validators.required]);
  } else {
      (this.signupChildForm.get('children') as FormArray).at(index)['controls'].email.setValidators([Validators.pattern(this.isEmailValid)]);
    }
    (this.signupChildForm.get('children') as FormArray).at(index)['controls'].email.updateValueAndValidity();   
  }



  kidsInfo(userid,parentId): FormGroup {
    return this.formBuilder.group({
      user_id: new FormControl(userid),
      email: new FormControl('', [Validators.pattern(this.isEmailValid)]),
      mobile_phone: new FormControl(''),
      isParentConsentCompleted:new FormControl(false),
      parent_user_id: new FormControl(parentId),
      // isParentConsentCompleted: new FormControl('', [Validators.pattern('true')])
      // email: new FormControl('', [Validators.pattern(this.isEmailValid), Validators.required]),
      // mobile_phone: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$"), Validators.maxLength(10), Validators.minLength(10)])
    });
  }
  get f() { return this.signupChildForm.get('children') as FormArray; }

  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');

    $(document).ready(function () {

      $(".desc").hide();
      $(".desc:first").show(); // THIS LINE IS ADDED!!!
      $("h3.open-close").click(function () {
        if ($(this).is(".current")) {
          $(this).removeClass("current");
          $(this).removeClass("active");
          $(this).next(".desc").slideUp(400);
        }
        else {
          $(".desc").slideUp(400);
          $(this).addClass("active");
          $("h3.open-close").removeClass("current");
          $(this).addClass("current");
          $(this).next(".desc").slideDown(400);
        }
      });
    });

    (this.signupChildForm.get('children') as FormArray).removeAt(0);
    // console.log(this.signupChildForm.controls);
    if (this.childDetails.length != 0) {
      this.childDetails.forEach(child => {
        (this.signupChildForm.get('children') as FormArray).push(this.kidsInfo(child.user_id,child.parent_user_id))
      });
    }

  }


  navigateToTerms(form) {
   this.submitted = true;
    if (form.invalid) {
      return;
    }

    this.childBelowThiteen = this.childDetails.filter(item => {
      if(item.age <  13){
        return item
      }
    })
  if(this.childBelowThiteen.length !== 0){
   
    form.value.children.forEach(signupForm => this.childBelowThiteen.forEach(childBelowAge => {
      if(childBelowAge.user_id === signupForm.user_id){
        if(signupForm.email){
          this.ischildParentFormExist.push(childBelowAge)
        }
   }
    }));
    console.log(this.ischildParentFormExist);
    
    
    if(this.ischildParentFormExist.length !== 0){
      this.signupInfo.children = form.value.children;
     this.showChild = false;
      this.showParentForm =true;
    }else{
      this.signupInfo.children = form.value.children;
      console.log(this.signupInfo)
      this.showChild = false
      this.showTermsCondition = true
    }
    
 }else{
    this.signupInfo.children = form.value.children;
    console.log(this.signupInfo)
    this.showChild = false
    this.showTermsCondition = true
  }
  }
}
