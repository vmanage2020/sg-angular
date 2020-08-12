import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { format } from 'path';
import { apiURL } from 'src/app/core/services/config';
declare var $: any;
declare var jQuery: any;
@Component({
  selector: 'app-position-skill-create',
  templateUrl: './position-skill-create.component.html',
  styleUrls: ['./position-skill-create.component.scss']
})
export class PositionSkillCreateComponent implements OnInit {
  breadCrumbItems: any;
  createPositionSkillForm: FormGroup;
  uid: any;
  dataModel:any;
  submitted = false;
  loading = false;
  sportsInfo: any;
  sportIdValid = false;
  positionValid=false
  noSkillCategory=false
  positionInfo: any;
  SkillcatList: any;
  skillInfo:any[]=[];
  skillLists:any;
  skillCatId:any;
  valueSport:any;
  constructor(private sharedService: SharedService, private formBuilder: FormBuilder, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/'}, { label: 'Position Skill Details', path: '/positionskill' }, { label: 'Create Position Skill', path: '/', active: true }];
    this.sharedService.announceMission('positionskill');
    this.uid = this.cookieService.getCookie('uid');
    this.activatedRoute
    .queryParams
    .subscribe(params => {
      this.valueSport = params['sport_id'] ;
    });
    this.createPositionSkillForm = this.formBuilder.group({
      uid:[''],
      sport_id: [null, [Validators.required]],
      position_id: [null,[Validators.required]],
      position_name:[''],
      skills_list: this.formBuilder.array([])
    })
    this.getAllSports(this.uid)
    this.createPositionSkillForm.patchValue({
    uid:this.uid
    })
    if(this.valueSport){
      // console.log(this.valueSport)
      this.OnSportChange(this.valueSport)
    }
   
  }

 ngAfterViewInit() {

 }

  getAllSports(uid) {
    this.loading = true
    this.dataServices.postData(apiURL.GET_ALL_SPORTS, {'uid': uid },this.cookieService.getCookie('token')).toPromise().then(res => {
      try {
        this.sportsInfo = res.data;
        this.loading = false
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })
  }
  OnSportChange(sid) {
    this.sportIdValid = false
    this.loading = true
    
    const control = <FormArray>this.createPositionSkillForm.controls['skills_list'];
        for(let i = control.length-1; i >= 0; i--) {
            control.removeAt(i)
    }
    
    this.createPositionSkillForm.patchValue({
      position_id: '',
      position_name:'',
      sport_id:sid
    })
    this.getPositionDropdown(sid, this.uid)
    this.getSkillAndSkillCat(sid, this.uid)
 }
 getPosName(event){
  //  console.log(event)
  this.positionValid=false
  this.createPositionSkillForm.patchValue({
    position_name: event.name
  })
 }
 getSkillAndSkillCat(sid,uid){
  this.dataServices.postData(apiURL.GET_SKILL_AND_SKILLCAT_LIST, { 'sport_id': sid, 'uid': uid },this.cookieService.getCookie('token')).subscribe(res => {
    try {
      // console.log(res)
      this.skillInfo = res;
      // console.log(this.skillInfo)
      this.loadForm(res);

    } catch (error) {
      console.log(error)
    }
  })
 }

 get skill():FormGroup{
  return this.formBuilder.group({
    skill_id: '',
    name: '',
    isChecked:[false]
            });
}

get skillCat():FormGroup{
  return this.formBuilder.group({
        skill_category_id: '',
        name: '',
        skills: this.formBuilder.array([
          ]),
        })
}

loadForm(data){
//  console.log(data.data);
 this.noSkillCategory=false
 if(data.data.length == 0){
  //  console.log("data.data")
   this.noSkillCategory=true
 }
 this.loading = true
    for (let line = 0; line < data.data.length; line++){
      const linesFormArray = this.createPositionSkillForm.get("skills_list") as FormArray;
      linesFormArray.push(this.skillCat);
      for (let player=0; player < data.data[line].skills.length; player++){
        const playersFormsArray = linesFormArray.at(line).get("skills") as FormArray;
        playersFormsArray.push(this.skill);
      }      
    }    
    const skillListArr = this.createPositionSkillForm.get("skills_list") as FormArray;
    skillListArr.patchValue(data.data);
    // console.log(this.createPositionSkillForm)
    this.loading = false
  }
 getPositionDropdown(sid, uid) {
    this.dataServices.postData(apiURL.GET_POSITION_LIST, { 'sport_id': sid, 'uid': uid },this.cookieService.getCookie('token')).toPromise().then(res => {
      try {
        this.positionInfo = res.data;
       
        this.loading = false
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })

  }
  createPositionSkill(form){
    // console.log(form.value);
    if (form.invalid) {
      if(!form.value.sport_id){
        this.sportIdValid=true
      }
      if(!form.value.position_id){
        this.positionValid=true
      }
      return
    }
    form.value.skills_list.forEach((element,i) => {

          element.skills.forEach((ele,index)=>{
            // console.log(ele)
            // console.log(index)
            if(!(ele.isChecked)){
            element.skills.splice(index);
           }
           else{
             delete ele.isChecked
           }
          })
      });  
      // if(!form.value.sport_id){
      //   this.sportIdValid=true
      // }
      // if(!form.value.position_id){
      //   this.positionValid=true
      // }
      // console.log(form.value.position_id);
      this.loading=true
      this.dataServices.postData(apiURL.CREATE_POSITION_SKILL,form.value,this.cookieService.getCookie('token')).subscribe(res => {
        try {
          // console.log(res)
          if (res.status) 
          {
            this.router.navigate(['/positionskill'], { queryParams: { sport_id: form.value.sport_id  } });
            this.loading=false;
          }
          else{
            this.loading=false;
            form.reset()
          }
        } catch (error) {
          console.log(error);
        }
      })
 }

 goBack()
 {
  this.router.navigate(['/positionskill'], { queryParams: { sport_id:  this.valueSport  } });
 }



}
