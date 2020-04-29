import { Component, OnInit, ElementRef } from '@angular/core';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
})
export class AvailabilityComponent implements OnInit {
  availabiltyForm: FormGroup;
  locationList: any = [];
  fb = new FormBuilder();
  registeredNumber: any = '';
  deletedAvailability: any = [];
  moment: any = {};
  currentStepFromStorage: any;
  daysArray: any = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
  ];
  days = [
    { day: 'Sunday', date: '1999-01-03' },
    { day: 'Monday', date: '1999-01-04' },
    { day: 'Tuesday', date: '1999-01-05' },
    { day: 'Wednesday', date: '1999-01-06' },
    { day: 'Thursday', date: '1999-01-07' },
    { day: 'Friday', date: '1999-01-08' },
    { day: 'Saturday', date: '1999-01-09' },
  ];
  currentUrlSection: any = '';
  profileMode = false;
  constructor(
    private caregiverService: CaregiverService,
    private validationService: ValidationService,
    private formBuilder: FormBuilder,
    private global: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private elementReference: ElementRef,
  ) {
    this.moment = extendMoment(Moment);
    this.registeredNumber = localStorage.getItem('registeredNumber');
    this.currentStepFromStorage = localStorage.getItem('currentOnBoardingStep');
  }

  ngOnInit(): void {
    const urlParts: any = this.router.url.split('/');
    this.currentUrlSection = urlParts[2];
    if (this.currentUrlSection === 'profile') {
      this.profileMode = true;
      localStorage.setItem('caregiverOnBoardCompleted', '1');
    } else {
      this.profileMode = false;
      localStorage.setItem('caregiverOnBoardCompleted', '0');
    }
    this.setAvailabilityForm();
    this.getLocationList();
    setTimeout(() => {
      this.getAvailability();
    }, 3000);
  }
  getAvailability() {
    this.caregiverService.getAvailability(this.registeredNumber).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          const availabilityDetails = this.availabiltyForm.get(
            'availability_details',
          ) as FormArray;
          returnData.data.availability.map((availability: any, index) => {
            const startTime: any = Number(availability.from_time.split(':')[0]);
            if (startTime > 12) {
              availability.from_meridian = 'PM';
              availability.from_time = startTime - 12;
            } else {
              availability.from_meridian = 'AM';
              availability.from_time = startTime;
            }
            // availability.from_time = startTime;

            if (availability.to_time === '23:59') {
              availability.to_meridian = 'PM';
              availability.to_time = 12;
            } else {
              const endTime: any = Number(availability.to_time.split(':')[0]);
              if (endTime >= 12) {
                availability.to_meridian = 'PM';
              } else {
                availability.to_meridian = 'AM';
              }
              if (availability.to_meridian === 'PM') {
                availability.to_time = endTime - 12;
              } else {
                availability.to_time = endTime;
              }
            }
            if (index > 0) {
              availabilityDetails.push(this.createAvailabilityDetails());
            }
          });

          availabilityDetails.patchValue(returnData.data.availability);
          this.availabiltyForm.patchValue({
            locations: this.prefillLocationSelection(
              this.availabiltyForm.get('locations').value,
              returnData.data.locations,
            ),
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  }
  removeAvailability(index: any) {
    const availabilityDetails = this.availabiltyForm.get(
      'availability_details',
    ) as FormArray;

    // Add ID in deleted Availability
    this.deletedAvailability.push(
      this.availabiltyForm.get('availability_details')['controls'][index]
        .controls.id.value,
    );
    // Remove from formarray
    availabilityDetails.removeAt(index);
  }
  prefillLocationSelection(location, selectedLocations) {
    return location.map(i => {
      if (i.subGroup.length > 0) {
        i.subGroup.map((j: any) => {
          const data = selectedLocations.filter(
            x => Number(x.id) === Number(j.id),
          )[0];
          if (data) {
            j.selected = true;
          } else {
            j.selected = false;
          }
          return j;
        });
      }
      return i;
    });
  }
  setAvailabilityForm() {
    this.availabiltyForm = new FormGroup({
      availability_details: this.formBuilder.array([
        this.createAvailabilityDetails(),
      ]),
      locations: new FormArray([]),
    });
  }
  createAvailabilityDetails(): FormGroup {
    return this.formBuilder.group({
      from_day: new FormControl('', [Validators.required]),
      to_day: new FormControl('', [Validators.required]),
      from_time: new FormControl('', [
        Validators.required,
        this.validationService.onlyNumberTime,
      ]),
      to_time: new FormControl('', [
        Validators.required,
        this.validationService.onlyNumberTime,
      ]),
      from_meridian: new FormControl({ value: 'AM', disabled: false }, [
        Validators.required,
      ]),
      to_meridian: new FormControl({ value: 'AM', disabled: false }, [
        Validators.required,
      ]),
      id: '',
    });
  }
  addAvailabilityOptions() {
    const availabilityDetails = this.availabiltyForm.get(
      'availability_details',
    ) as FormArray;
    availabilityDetails.push(this.createAvailabilityDetails());
  }
  getLocationList() {
    this.caregiverService.getLocationList().subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.locationList = returnData.data;
          this.availabiltyForm.setControl(
            'locations',
            this.createLocations(this.locationList),
          );
        } else {
          this.locationList = [];
        }
      },
      err => {
        console.error(err);
      },
    );
  }
  createSubLocation(subLocation) {
    return this.fb.array(
      subLocation.map(i => {
        return this.fb.group({
          name: i.name,
          selected: false,
          id: i.id,
          parent_id: i.parent_id,
        });
      }),
    );
  }
  createLocations(locationListInput) {
    return this.fb.array(
      locationListInput.map(i => {
        return this.fb.group({
          name: i.name,
          id: i.id,
          subGroup: this.createSubLocation(i.subLocations),
        });
      }),
    );
  }
  checkConflictAvailability(e, day, days) {
    let resDataObj = {
      success: true,
      message: null,
    };
    for (let i = e.from_day; i <= e.to_day; i++) {
      const fromDayDb = this.moment(`${days[i].date} ${e.from_time}`);
      const toDayDb = this.moment(`${days[i].date} ${e.to_time}`);
      const range1 = this.moment.range(fromDayDb, toDayDb);

      for (let j = day.from_day; j <= day.to_day; j++) {
        const fromDayUser = this.moment(`${days[j].date} ${day.from_time}`);
        const toDayUser = this.moment(`${days[j].date} ${day.to_time}`);
        const range2 = this.moment.range(fromDayUser, toDayUser);

        if (range1.overlaps(range2)) {
          resDataObj = {
            success: false,
            message: `Conflicting availability for ${days[e.from_day].day} to ${
              days[e.to_day].day
            } hours`,
          };
        }
      }
    }
    return resDataObj;
  }
  public addAvailability() {
    let callAPI = true;
    if (!this.availabiltyForm.valid) {
      this.validationService.validateAllFormArrayFields(this.availabiltyForm);
      return false;
    }
    // Check the validation here
    for (const [
      index,
      e,
    ] of this.availabiltyForm.value.availability_details.entries()) {
      console.log('e>>>>>>.', e);
      e.from_day = Number(e.from_day);
      e.to_day = Number(e.to_day);

      const checkDay = this.availabiltyForm.value.availability_details.filter(
        (cd, i) => {
          cd.from_day = Number(cd.from_day);
          cd.to_day = Number(cd.to_day);
          return i !== index;
        },
      );
      if (checkDay.length) {
        const results = [];
        for (const day of checkDay) {
          results.push(this.checkConflictAvailability(e, day, this.days));
        }
        if (results.length > 0) {
          results.map((resultData: any) => {
            if (resultData.success === false) {
              callAPI = false;
              this.toastr.error(resultData.message);
              return false;
            }
          });
        }
      }
      let startTimeProper: any = '';
      let endTimeProper: any = '';
      if (e.from_meridian === 'PM') {
        startTimeProper = Number(e.from_time + 12);
      } else {
        startTimeProper = Number(e.from_time);
      }
      if (e.to_meridian === 'PM') {
        endTimeProper = Number(e.to_time + 12);
      } else {
        endTimeProper = Number(e.to_time);
      }
      if (startTimeProper >= endTimeProper) {
        this.toastr.error('From time should be smaller then To time');
        return false;
      }
    }

    for (const [
      index,
      e,
    ] of this.availabiltyForm.value.availability_details.entries()) {
      e.from_day = String(e.from_day);
      e.to_day = String(e.to_day);
    }

    // this.checkConflictAvailability(this.availabiltyForm.value, this.days)
    if (callAPI) {
      const dataToSend: any = {};
      dataToSend.registration_no = this.registeredNumber;
      dataToSend.deleted_availability = [];
      dataToSend.locations = [];
      dataToSend.availability = [];
      this.availabiltyForm.value.locations.map((mainLocation: any) => {
        if (mainLocation.subGroup.length > 0) {
          mainLocation.subGroup.map((subLocation: any) => {
            if (subLocation.selected === true) {
              dataToSend.locations.push(subLocation.id);
            }
          });
        }
      });
      if (this.availabiltyForm.value.availability_details.length > 0) {
        this.availabiltyForm.value.availability_details.map(
          (availability: any) => {
            const tempArray: any = {};
            tempArray.from_day = availability.from_day;
            tempArray.to_day = availability.to_day;
            tempArray.to_day = availability.to_day;
            if (availability.from_meridian === 'AM') {
              tempArray.from_time =
                ('0' + availability.from_time).slice(-2) + ':00';
            } else if (availability.from_meridian === 'PM') {
              if (availability.from_time === 12) {
                tempArray.from_time = '23:59';
              } else {
                tempArray.from_time =
                  String(
                    Number(('0' + availability.from_time).slice(-2)) + 12,
                  ) + ':00';
              }
            }
            if (availability.to_meridian === 'AM') {
              tempArray.to_time =
                ('0' + availability.to_time).slice(-2) + ':00';
            } else if (availability.to_meridian === 'PM') {
              if (availability.to_time === 12) {
                tempArray.to_time = '23:59';
              } else {
                tempArray.to_time =
                  String(Number(('0' + availability.to_time).slice(-2)) + 12) +
                  ':00';
              }
            }
            if (availability.id && availability.id !== '') {
              tempArray.id = availability.id;
            }

            dataToSend.availability.push(tempArray);
          },
        );
      }
      dataToSend.deleted_availability = this.deletedAvailability;

      if (dataToSend.locations.length > 5) {
        this.toastr.error('Maximum 5 locations are allowed');
        return false;
      }
      this.caregiverService.addUpdateAvailability(dataToSend).subscribe(
        (returnData: any) => {
          if (returnData.success === true) {
            this.toastr.success(returnData.message);
            localStorage.setItem('currentOnBoardingStep', '5');
            if (this.currentStepFromStorage > 5) {
              this.global.currentOnBoardStep = this.currentStepFromStorage;
            } else {
              this.global.currentOnBoardStep = 5;
            }
            if (this.profileMode === true) {
              localStorage.setItem('currentOnBoardingStep', '0');
            }
            this.router.navigate([
              `/caregiver/${this.currentUrlSection}/charges`,
            ]);
          }
        },
        err => {
          if (err.status === 400) {
            err.data.map((errorData: any) => {
              this.toastr.error(errorData.message);
            });
          } else {
            console.error(err);
          }
        },
      );
    }
  }
}
