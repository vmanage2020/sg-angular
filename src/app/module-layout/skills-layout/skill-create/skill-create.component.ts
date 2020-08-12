import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { element } from 'protractor';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL } from 'src/app/core/services/config';
@Component({
  selector: 'app-skill-create',
  templateUrl: './skill-create.component.html',
  styleUrls: ['./skill-create.component.scss']
})
export class SkillCreateComponent implements OnInit {

  breadCrumbItems: any;
  sportId: any;
  loading=false;
  sportsInfo:any;
  uid:any;
  error=false;
  message;any;
  submitted = false;
  skillCategoryInfo:any;
  createSkillForm: FormGroup
  sportIdValid=false;
  categoryIdValid=false
  // any = {
  //   sport_id: '',
  //   skill_category_id:'',
  //   name: null
  // }
skillCategoryId
  constructor(private sharedService:SharedService,private formBuilder: FormBuilder,private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute,public cookieService:CookieService) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/' },{label: 'Skill Details', path: '/skill'},{label: 'Create Skill', path: '/',active:true}];
    this.sharedService.announceMission('skill');
    this.uid=this.cookieService.getCookie('uid')
    this.activatedRoute
      .queryParams
      .subscribe(params => {          
          this.sportId = params['sport_id'];
          this.skillCategoryId=params['skill_category_id']    
    });
    this.createSkillForm = this.formBuilder.group({
      sport_id: [null, [Validators.required]],
      skill_category_id:[null, [Validators.required]],
      name: ['', [Validators.required]],
    })
    this.createSkillForm.patchValue({
      sport_id: this.sportId,
      skill_category_id:this.skillCategoryId
    })
    this.getAllSports(this.uid)
    if(this.sportId){
      this.getAllCategory(this.sportId)

    }
  
// console.log( this.sportId)
// console.log(this.skillCategoryId)
  }
  get f() { return this.createSkillForm.controls; }

  createSkill(form) {
    // console.log(form)
    this.submitted = true;
    if (form.invalid) {
       if (!(form.value.sport_id)) {
        this.sportIdValid=true
       }

       if (!(form.value.skill_category_id)) {
        this.categoryIdValid=true
       }
      return;
     }
    this.loading=true
   
    form.value['uid']=this.uid
    // console.log(form.value)
    this.dataServices.postData(apiURL.CREATE_SKILL, form.value,this.cookieService.getCookie('token')).subscribe(res => {
      try {
        if (res.status) {
          this.loading=false;
          this.router.navigate(['/skill'], { queryParams: { sport_id: form.value.sport_id , skill_category_id:form.value.skill_category_id } })
        }
        else{
          this.error=true
          this.message=res.message
          this.loading=false
          form.reset()

        }
      } catch (error) {
        console.log(error);
      }
    })
  }
  getAllSports(uid){

    this.dataServices.postData(apiURL.GET_ALL_SPORTS,{'uid':uid},this.cookieService.getCookie('token')).toPromise().then(res => {
      try {        
        this.sportsInfo = res.data;   
          //  console.log(this.sportsInfo)
        // this.loaded=false;  
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })


  }

  hideCategoryReq(){
    this.categoryIdValid=false
  }
  filterSports(event){    
    this.sportIdValid=false
    this.sportId =event.sport_id;
    // console.log(this.sportId)
    this.getAllCategory(this.sportId)

  }
  getAllCategory(catId){
    this.dataServices.postData(apiURL.GET_ALL_SKILLCATEGORY_LIST, {'sport_id':catId,'uid':this.uid},this.cookieService.getCookie('token')).subscribe(res => {
      try {        
        this.skillCategoryInfo = res.data;   
        // console.log(this.skillCategoryInfo)
        // this.loading=false
      } catch (error) {
        console.log(error)
      }
    })
  }
  closeToast(){
    this.error=false
  }


  goBack() {    
    this.router.navigate(['/skill'], { queryParams: { sport_id: this.createSkillForm.value.sport_id, skill_category_id:this.createSkillForm.value.skill_category_id   } })
  }


}
