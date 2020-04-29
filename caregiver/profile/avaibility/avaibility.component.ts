import { Component, OnInit } from '@angular/core';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-avaibility',
  templateUrl: './avaibility.component.html',
})
export class AvaibilityComponent implements OnInit {
  registrationNo = 0;
  days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  availabilityArray: any = [];
  locationsArray: any = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private caregiverService: CaregiverService,
  ) {}

  ngOnInit(): void {
    this.registrationNo = Number(
      this.activatedRoute.snapshot.paramMap.get('id'),
    );
    this.getProfileAvailabilityDetails();
  }
  getProfileAvailabilityDetails() {
    this.caregiverService
      .getProfileAvailabilityDetails(this.registrationNo)
      .subscribe((returnData: any) => {
        if (returnData.success === true) {
          this.availabilityArray = returnData.data.availability;
          this.locationsArray = returnData.data.locations;
        }
      });
  }
}
