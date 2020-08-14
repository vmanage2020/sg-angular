import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL } from 'src/app/core/services/config';

@Component({
  selector: 'app-position-skill-edit',
  templateUrl: './position-skill-edit.component.html',
  styleUrls: ['./position-skill-edit.component.scss']
})
export class PositionSkillEditComponent implements OnInit {

  breadCrumbItems: any;
  updatePositionSkillForm: FormGroup;
  uid: any;
  dataModel:any;
  sportId:any;
  positionSkillId:any;
  submitted = false;
  loading = false;
  sportsInfo: any;
  sportIdValid = false;
  positionValid=false
  positionInfo: any;
  booleanValue=true;
  SkillcatList: any;
  skillInfo:any[]=[];
  skillLists:any;
  skillCatId:any;
  constructor(private sharedService: SharedService, private formBuilder: FormBuilder, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/'}, { label: 'Position Skill Details', path: '/positionskill' }, { label: 'Update Position Skill', path: '/', active: true }];
    this.sharedService.announceMission('positionskill');
    this.uid = this.cookieService.getCookie('uid');
    this.activatedRoute.params.subscribe(params => {
      this.sportId = params['sid'];
      this.positionSkillId = params['psid'];
     
    });
    this.updatePositionSkillForm = this.formBuilder.group({
      uid:[''],
      sport_id: [null, [Validators.required]],
      position_skill_id:[''],
      position_id: [null,[Validators.required]],
      position_name:[''],
      skills_list: this.formBuilder.array([])
    })
    this.getAllSports(this.uid)
    this.updatePositionSkillForm.patchValue({
    uid:this.uid,
    position_skill_id:this.positionSkillId
    })
    if(this.uid && this.sportId && this.positionSkillId)
    {
       this.getPositionSkillById(this.uid,this.sportId,this.positionSkillId)
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
  getPositionSkillById(uid,sid,psid){
    this.loading = true;
    this.dataServices.postData(apiURL.GET_POSITIONSKILL_BY_ID, { 'sport_id': sid, 'position_skill_id': psid, 'uid': uid },this.cookieService.getCookie('token')).subscribe(res => {
      try {
        // console.log(res)
        if (res.status) {
           this.skillInfo = res.data;
          // console.log(res.data)
          if(res.data.sport_id){
            this.getPositionDropdown(res.data.sport_id,this.uid) 
          }
          this.updatePositionSkillForm.patchValue({
            sport_id: res.data.sport_id,
            name: res.data.name,
            position_id: res.data.position_id,
            position_name: res.data.position_name,
         })
         this.updatePositionSkillForm.controls.sport_id.disable();
          // console.log(res.data.skills_list)
            this.loadForm(res.data.skills_list)
          this.loading = false;
        }
      } catch (error) {
        console.log(error);
      }
    })
  }

 get skill():FormGroup{
  return this.formBuilder.group({
    skill_id: '',
    name: '',
    isChecked:[true]
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

getPosName(event){
  //  console.log(event)
  this.positionValid=false
  this.updatePositionSkillForm.patchValue({
    position_id:event.position_id,
    position_name: event.name
  })
 }

loadForm(data){
  this.loading = true
    for (let line = 0; line < data.length; line++){
      const linesFormArray = this.updatePositionSkillForm.get("skills_list") as FormArray;
      linesFormArray.push(this.skillCat);
      for (let player=0; player < data[line].skills.length; player++){
        const playersFormsArray = linesFormArray.at(line).get("skills") as FormArray;
        playersFormsArray.push(this.skill);
      }      
    }    
    const skillListArr = this.updatePositionSkillForm.get("skills_list") as FormArray;
     skillListArr.patchValue(data);
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
  updatePositionSkill(form){
    // console.log(form.value);
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
      
      if(!form.value.position_id){
        this.positionValid=true
      }
      form.value.sport_id=this.sportId
      // console.log(form.value);
      this.loading=true
      this.dataServices.postData(apiURL.UPDATE_POSITIONSKILL,form.value,this.cookieService.getCookie('token')).subscribe(res => {
        try {
          // console.log(res)
          if (res.status) 
          { 
            // console.log(res)
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
  this.router.navigate(['/positionskill'], { queryParams: { sport_id: this.sportId  } });
 }


}
