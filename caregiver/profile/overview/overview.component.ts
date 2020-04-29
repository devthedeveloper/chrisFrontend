import { Component, OnInit } from '@angular/core';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  registrationNo = 0;
  overviewDetails: any = {};
  languagesArray: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private caregiverService: CaregiverService,
  ) {}

  ngOnInit(): void {
    this.registrationNo = Number(
      this.activatedRoute.snapshot.paramMap.get('id'),
    );
    this.getProfileOverviewDetails();
  }
  getProfileOverviewDetails() {
    this.caregiverService
      .getProfileOverviewDetails(this.registrationNo)
      .subscribe((returnData: any) => {
        if (returnData.success === true) {
          this.overviewDetails = returnData.data;
          this.overviewDetails.registration_no =
            returnData.data.registration_no;
          this.overviewDetails.aboutMe = returnData.data.self_introduction;
          this.languagesArray = returnData.data.languages;
        }
      });
  }
}
