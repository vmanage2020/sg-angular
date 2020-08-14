import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL } from 'src/app/core/services/config';

@Component({
  selector: 'app-skill-edit',
  templateUrl: './skill-edit.component.html',
  styleUrls: ['./skill-edit.component.scss']
})
export class SkillEditComponent implements OnInit {

  breadCrumbItems: any;
  sportId: any;
  loading=false;
  skillCategoryId: any;
  skillId:any;
  uid:any;
  constructor(private sharedService:SharedService,private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute,public cookieService:CookieService) { }

  updateSkillForm: any = {
    sport_id: '',
    skill_category_id: '',
    skill_id:'',
    name: null,
  }


  ngOnInit() {

    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/' },{ label: 'Skill Details', path: '/skill'},{label: 'Update Skill', path: '/', active:true}];
    this.sharedService.announceMission('skill');
    this.uid=this.cookieService.getCookie('uid')
    this.activatedRoute.params.subscribe(params => {          
      this.sportId = params['id'];
      this.skillCategoryId = params['skid'];
      this.skillId=params['sid'];  
      if(this.sportId && this.skillCategoryId && this.skillId &&  this.uid) {
        this.getSkillsById(this.sportId, this.skillCategoryId,this.skillId, this.uid);
      }
      
    });

  }

  getSkillsById(id, sid,skillid,uid) {
    this.loading=true
    this.dataServices.postData(apiURL.GET_SKILL_BY_ID, {'sport_id': id, 'skill_category_id': sid,'skill_id': skillid,'uid':uid},this.cookieService.getCookie('token')).subscribe(res => {
      try {
        if (res.status) {
          this.updateSkillForm = res.data;
          this.loading=false;
        }
      } catch (error) {
        console.log(error);
      }
    })
  }

  updateSkill(form) {
    this.loading=true
    form.value.sport_id = this.sportId;
    form.value.skill_category_id = this.skillCategoryId;
    form.value.skill_id= this.skillId;
    form.value['uid']=this.uid
    this.dataServices.postData(apiURL.UPDATE_SKILL, form.value,this.cookieService.getCookie('token')).subscribe(res => {
      try {
        if (res.status) {   
                
          this.router.navigate(['/skill'], { queryParams: { sport_id: form.value.sport_id , skill_category_id:form.value.skill_category_id } })
          this.loading=false
        }
      } catch (error) {
        console.log(error);
      }
    })
  }

  goBack() {    
    this.router.navigate(['/skill'], { queryParams: { sport_id: this.sportId, skill_category_id:this.skillCategoryId   } })
  }

}
