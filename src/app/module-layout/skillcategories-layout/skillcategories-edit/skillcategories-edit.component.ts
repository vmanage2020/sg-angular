import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL } from 'src/app/core/services/config';

@Component({
  selector: 'app-skillcategories-edit',
  templateUrl: './skillcategories-edit.component.html',
  styleUrls: ['./skillcategories-edit.component.scss']
})
export class SkillcategoriesEditComponent implements OnInit {

  breadCrumbItems: any;
  sportId: any;
  skillCategoryId: any;
loading=false;
error=false;
message:any;
uid:any
  constructor(private sharedService:SharedService,private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute,public cookieService:CookieService) { }

  updateSkillCategoryForm: any = {
    sport_id: '',
    skill_category_id: '',
    name: null,
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/' },{ label: 'Skill Category Details', path: '/skillcategories'},{label: 'Update Skill Category', path: '/', active:true}];
    this.sharedService.announceMission('skillcategory');
    this.uid = this.cookieService.getCookie('uid');
    this.activatedRoute.params.subscribe(params => {          
      this.sportId = params['sid'];
      this.skillCategoryId = params['skid'];  
      if(this.sportId && this.skillCategoryId && this.uid) {
        this.getSportsById(this.sportId, this.skillCategoryId,this.uid);
      }
      
    });
  }

  getSportsById(id, sid,uid) {
    this.loading=true;
    this.dataServices.postData(apiURL.GET_SKILLCAT_BY_ID, {'sport_id': id, 'skill_category_id': sid,'uid':uid},this.cookieService.getCookie('token')).subscribe(res => {
      try {
        if (res.status) {
          this.updateSkillCategoryForm = res.data;
          this.loading=false;
        }
        else{
          this.error=true
          this.loading=false;
          this.message=res.message
        }
      } catch (error) {
        console.log(error);
      }
    })
  }

  updateSkillCategory(form) {
    form.value.sport_id = this.sportId;
    form.value.skill_category_id = this.skillCategoryId;
    form.value['uid']=this.uid
    this.loading=true;
    this.dataServices.postData(apiURL.UPDATE_SKILLCAT, form.value,this.cookieService.getCookie('token')).subscribe(res => {
      try {
        if (res.status) {
          this.loading=false;
          this.router.navigate(['/skillcategories']);
        }
        else{
          this.error=true
          this.loading=false;
          this.message=res.message
        }
      } catch (error) {
        console.log(error);
      }
    })
  }
  closeToast(){
    this.error=false
  }

  goBack() {
    this.router.navigate(['/skillcategories']);
  }

}
