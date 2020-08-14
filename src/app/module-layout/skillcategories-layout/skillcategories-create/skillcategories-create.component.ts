import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL } from 'src/app/core/services/config';

@Component({
  selector: 'app-skillcategories-create',
  templateUrl: './skillcategories-create.component.html',
  styleUrls: ['./skillcategories-create.component.scss']
})
export class SkillcategoriesCreateComponent implements OnInit {

  breadCrumbItems: any;
  sportId: any;
  loading = false;
  uid: any;
  error = false;
  message; any;
  sportIdValid=false;
  submitted = false;
  sportsInfo: any;
  constructor(private sharedService:SharedService,private formBuilder: FormBuilder, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService) { }

  createSkillCategoryForm: FormGroup;
  // any = {
  //   sport_id: '',
  //   name: null
  // }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/' }, { label: 'Skill Category Details', path: '/skillcategories' }, { label: 'Create Skill Category', path: '/', active: true }];
    this.sharedService.announceMission('skillcategory');
    this.uid = this.cookieService.getCookie('uid')
    this.activatedRoute
      .queryParams
      .subscribe(params => {
        this.sportId = params['sport_id'];
      });
    this.createSkillCategoryForm = this.formBuilder.group({
      sport_id: [null, [Validators.required]],
      name: ['', [Validators.required]],
    })
    this.createSkillCategoryForm.patchValue({
      sport_id: this.sportId
    })

    this.getAllSports(this.uid)

  }
  getAllSports(uid) {
    this.loading = true
    this.dataServices.postData(apiURL.GET_ALL_SPORTS, { 'uid': uid },this.cookieService.getCookie('token')).toPromise().then(res => {
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
  get f() { return this.createSkillCategoryForm.controls; }

  createSkillCategory(form) {

    this.submitted = true;
    if (form.invalid) {
       if (form.value.sport_id === null) {
        this.sportIdValid=true
       }
      return;
     }
    form.value['uid'] = this.uid
    // console.log(form.value)
    this.loading = true;
    this.dataServices.postData(apiURL.CREATE_SKILLCATEGORY, form.value,this.cookieService.getCookie('token')).subscribe(res => {
      try {
        if (res.status) {
          this.loading = false;
          this.router.navigate(['/skillcategories'], { queryParams: { sport_id: form.value.sport_id  } })
        }
        else {
          this.error = true
          this.loading = false;
          this.message = res.message
          form.reset()
        }
      } catch (error) {
        console.log(error);
      }
    })
  }
  closeToast() {
    this.error = false
  }
  hideSportReq(){
    this.sportIdValid=false
  }


  goBack() {
    this.router.navigate(['/skillcategories'], { queryParams: { sport_id: this.createSkillCategoryForm.value.sport_id  } })
  }
}
