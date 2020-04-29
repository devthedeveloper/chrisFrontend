import { Component, OnInit } from '@angular/core';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
})
export class InfoComponent implements OnInit {
  registrationNo = 0;
  personalCareArray: any = [];
  specialCareArray: any = [];
  employerArray: any = [];
  currentEmployer: any = {};
  previousEmployerArray: any = [];
  workType = ['Full time', 'Part time'];
  currentYear = 0;
  currentMonth = 0;
  currentDay = 0;
  currentEmployerSpanYear = 0;
  currentEmployerSpanMonth = 0;
  currentEmployerSpanDays = 0;
  previousEmployerYearSpan: any = [];
  showCurrentEmployerEmpty = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private caregiverService: CaregiverService,
  ) {}

  ngOnInit(): void {
    this.registrationNo = Number(
      this.activatedRoute.snapshot.paramMap.get('id'),
    );
    this.getDate();
    this.getProfileInfoDetails();
  }
  getDate() {
    const currentTime = new Date();
    this.currentMonth = currentTime.getMonth() + 1;
    this.currentDay = currentTime.getDate();
    this.currentYear = currentTime.getFullYear();
  }
  getProfileInfoDetails() {
    this.caregiverService
      .getProfileInfoDetails(this.registrationNo)
      .subscribe((returnData: any) => {
        if (returnData.success === true) {
          for (let i = 0; i <= returnData.data.skills.length - 1; i++) {
            if (returnData.data.skills[i].type === '1') {
              this.personalCareArray.push(
                returnData.data.skills[i].english_title,
              );
            } else if (returnData.data.skills[i].type === '2') {
              this.specialCareArray.push(
                returnData.data.skills[i].english_title,
              );
            }
          }
          this.employerArray = returnData.data.employer;
          for (let i = 0; i <= this.employerArray.length - 1; i++) {
            if (this.employerArray[i].is_current_employer === '0') {
              this.currentEmployer = this.employerArray[i];
            } else {
              this.previousEmployerArray.push(this.employerArray[i]);
            }
          }
        }
        if (this.isEmpty(this.currentEmployer)) {
          this.showCurrentEmployerEmpty = true;
        }
        this.currentEmployerSpanYear =
          this.currentYear - this.currentEmployer.from_year;
        if (this.currentEmployerSpanYear === 0) {
          this.currentEmployerSpanMonth =
            this.currentMonth - this.currentEmployer.from_month;
          if (this.currentEmployerSpanMonth === 0) {
            this.currentEmployerSpanDays = this.currentDay;
          }
        }

        for (let i = 0; i <= this.previousEmployerArray.length - 1; i++) {
          if (
            this.previousEmployerArray[i].to_year -
              this.previousEmployerArray[i].from_year >
            0
          ) {
            this.previousEmployerYearSpan.push(
              this.previousEmployerArray[i].to_year -
                this.previousEmployerArray[i].from_year,
            );
          }
        }
      });
  }
  isEmpty(obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  }
}
