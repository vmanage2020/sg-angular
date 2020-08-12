import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { WizardComponent as BaseWizardComponent } from 'angular-archwizard';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-parent-consent-form',
  templateUrl: './parent-consent-form.component.html',
  styleUrls: ['./parent-consent-form.component.scss']
})
export class ParentConsentFormComponent implements OnInit {
  @Input('userInfo') userInfo: any = {};
  @Input('signupInfo') signupInfo: any = {};
  @ViewChild('wizardForm', { static: false }) wizard: BaseWizardComponent;
  @Input('childBelowThiteen') childBelowThiteen: any = {};
  childDetails:any=[];
  submitted:boolean=false;
  parentConsentform:FormGroup;
 
  showTermsCondition:boolean=false;
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.parentConsentform = this.formBuilder.group({
      children: this.formBuilder.array([this.kidsInfo(null)])
    });
    
    console.log(this.childBelowThiteen);
    // this.childDetails = this.childBelowThiteen;
   
    if(this.childBelowThiteen && this.signupInfo.children){
      this.childBelowThiteen.forEach(childLvl => this.signupInfo.children.forEach(child2 => {
        if(child2.user_id === childLvl.user_id){
          if(child2.email){
            childLvl.email_address=child2.email
            this.childDetails.push(childLvl)
          }
          
        }
      }));
    }
    console.log(this.childDetails,"childDeatil");
    // if (this.childDetails[0].date_of_birth) {
    //   if (typeof(this.childDetails.date_of_birth) !== "string") {
    //     this.childDetails.date_of_birth = moment(this.childDetails.date_of_birth.$date.toDate()).format('MM-DD-YYYY').toString();
    //     this.childDetails.date_of_birth = moment(this.childDetails.date_of_birth.$date).format('MM-DD-YYYY').toString();
    //     this.childDetails.date_of_birth = moment(this.childDetails.date_of_birth).format('MM-DD-YYYY').toString();
    //   } else {
    //     this.childDetails.date_of_birth = moment(this.childDetails.date_of_birth.$date).format('MM-DD-YYYY').toString();
    //   }

    // }
    
   }
  kidsInfo(userid): FormGroup {
    return this.formBuilder.group({
      user_id: new FormControl(userid),
      isParentConsentCompleted: new FormControl('', [Validators.pattern('true')])
  });
  }
  get f() { return this.parentConsentform.get('children') as FormArray; }
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
  
   (this.parentConsentform.get('children') as FormArray).removeAt(0);
    // console.log(this.signupChildForm.controls);
    if (this.childDetails.length != 0) {
      this.childDetails.forEach(child => {
        if(child.email_address){
          (this.parentConsentform.get('children') as FormArray).push(this.kidsInfo(child.user_id))
        }
      });
    }
    console.log(this.parentConsentform.controls);
 }
 ngAfterContentInit() {
  
}
  formSubmit(form,i){
    console.log(form);
    console.log(i,"index");
  if((this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.value !== true){
    console.log((this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.value);
   
    (this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.setValidators([Validators.requiredTrue]);
    (this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.updateValueAndValidity();
    this.submitted = true;
    console.log(form);
    }else{
      console.log((this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.value);
      if (this.parentConsentform.valid) {
        this.wizard.navigation.goToNextStep();
      }
      this.submitted = true;
    }
    
  }
  
  patchValueForParent(event, item, i, data) {
    console.log(event);
    console.log((this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted);
    
    if (event.target.checked) {
      (this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.patchValue(true)
    } else {
      (this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.setValidators([Validators.requiredTrue]);
       console.log((this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.value);
       (this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.patchValue('');        
        
      // }

      // console.log((this.signupChildForm.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted);
    }
  }
  navigateToTerms(form,i){
    if((this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.value !== true){
      // console.log((this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.value);
      (this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.setValidators([Validators.requiredTrue]);
      (this.parentConsentform.get('children') as FormArray).at(i)['controls'].isParentConsentCompleted.updateValueAndValidity();
      this.submitted = true;
      
      }else{
        // console.log( this.signupInfo.children);
        // console.log( form.value.children);
        if(this.signupInfo){
          form.value.children.forEach(childLvl => this.signupInfo.children.forEach(child2 => {
            console.log(child2.user_id);
            console.log(childLvl.user_id);
            if(child2.user_id === childLvl.user_id){
              child2.isParentConsentCompleted=true;
            }
          
          }));
        }
        console.log(this.signupInfo);
        this.showTermsCondition=true;
      }

  }
}
