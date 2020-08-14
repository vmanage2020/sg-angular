import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Observable, Subject } from 'rxjs';

import { Table } from '../../../dataTable/advanced.model';

import { tableData } from '../../../dataTable/data';

import { AdvancedService } from '../../../dataTable/advanced.service';
import { AdvancedSortableDirective, SortEvent } from '../../../dataTable/advanced-sortable.directive';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL } from 'src/app/core/services/config';

@Component({
  selector: 'app-skill-grid',
  templateUrl: './skill-grid.component.html',
  styleUrls: ['./skill-grid.component.scss'],
  providers: [AdvancedService, DecimalPipe]
})

/**
 * Advanced table component - handling the advanced table with sidebar and content
 */
export class SkillGridComponent implements OnInit {
  // bread crum data
  breadCrumbItems: any;
  sportId: any;
  skillCategoryId: any;
  loading = false;
  skillInfo: any = [];
  sportsInfo: any;
  sportsList: any = '';
  skillcategoryList: any = '';
  skillCategoryInfo: any;
  successMessage = false

  noDataDefault = true
  term: any;
  // sellersData: Sellers[];
  // page number
  page = 1;
  // default page size
  pageSize = 10;
  // total number of records
  totalRecords = 0;

  // start and end index
  startIndex = 1;
  endIndex = 10;
  uid: any;

  skillCategoryName: any;
  sportName: any;
  // Table data
  tableData: Table[];

  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private sharedService:SharedService,private modalService: NgbModal, private dataServices: DataService, public cookieService: CookieService, public router: Router, public service: AdvancedService, private activatedRoute: ActivatedRoute) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
    // this.activatedRoute.params.subscribe(params => {
    //   this.sportId = params['id'];
    //   this.skillCategoryId = params['skid']
    // });
  }

  ngOnInit() {

    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/' }, { label: 'Skill Details', path: '/', active: true }];
    this.sharedService.announceMission('skill');
    this.uid = this.cookieService.getCookie('uid')
    this.getAllSports(this.uid)

    this.activatedRoute
      .queryParams
      .subscribe(params => {
        this.sportId = params['sport_id'];
        this.skillCategoryId = params['skill_category_id']
      });
    if (this.sportId && this.skillCategoryId) {
      this.getGridResponse(this.sportId, this.skillCategoryId, this.uid, this.page, this.pageSize);
      this.sportName = this.sportId
      this.getAllCategory(this.sportId)
      this.skillCategoryName = this.skillCategoryId
    }
  }


  getAllSports(uid) {

    this.dataServices.postData(apiURL.GET_ALL_SPORTS, { 'uid': uid },this.cookieService.getCookie('token')).toPromise().then(res => {
      try {
        this.sportsInfo = res.data;
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })
  }
  onSportsChange(event, skillCatId) {
    // console.log(skillCatId)
    this.sportId = event.sport_id;
    this.skillCategoryName = "";
    // console.log(skillCatId)
    this.getAllCategory(event.sport_id)

    this.getGridResponse(event.sport_id, this.skillcategoryList, this.uid, this.page, this.pageSize)
  }
  getAllCategory(sid) {
    this.dataServices.postData(apiURL.GET_ALL_SKILLCATEGORY_LIST, { 'sport_id': sid, 'uid': this.uid },this.cookieService.getCookie('token')).subscribe(res => {
      try {
        this.skillCategoryInfo = res.data;
        // this.skillCategoryName = "";
      } catch (error) {
        console.log(error)
      }
    })
  }

  filterSkills(event, sportsId) {

    this.sportId = sportsId;

    this.skillCategoryId = event.skill_category_id
    this.getGridResponse(sportsId, event.skill_category_id, this.uid, this.page, this.pageSize)
  }
  getGridResponse(sportId, skillCategoryId, uid, pageNo, itemPerPage) {
    this.noDataDefault = false
    this.loading = true
    this.dataServices.postData(apiURL.GET_SKILL_FOR_GRID, { 'sport_id': sportId, 'skill_category_id': skillCategoryId, 'uid': uid, 'page_no': pageNo, 'item_per_page': itemPerPage, 'search': '' },this.cookieService.getCookie('token')).subscribe(res => {
      try {
        if (res.status) {
          // console.log(res)
          this.skillInfo = res.data.data;
          this.skillInfo.forEach(element => {
            element.created_datetime = moment(element.created_datetime).format('DD MMM-YYYY HH:mm').toString();
            element.sport_id = this.sportId;
            element.skill_category_id = this.skillCategoryId;
          });
          this.totalRecords = res.data.total_items;
          if (this.endIndex > this.totalRecords) {
            this.endIndex = this.totalRecords;
          }
          this.loading = false
        } else {
          this.loading = false
          this.skillInfo = []
        }

      } catch (error) {
        console.log(error)
      }
    })
  }


  onPageChange(page: any): void {
    // this.page=page
    this.startIndex = (page - 1) * this.pageSize + 1;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.skillInfo = this.skillInfo.slice(this.startIndex - 1, this.endIndex - 1);
    this.getGridResponse(this.sportId, this.skillCategoryId, this.uid, page, this.pageSize);
  }
  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = tableData;
  }

  /**
   * Sort table data
   * @param param0 sort the column
   *
   */
  // onSort({ column, direction }: SortEvent) {
  //   // resetting other headers
  //   this.headers.forEach(header => {
  //     if (header.sortable !== column) {
  //       header.direction = '';
  //     }
  //   });
  //   this.service.sortColumn = column;
  //   this.service.sortDirection = direction;
  // }
}
