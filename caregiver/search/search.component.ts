import { Component, OnInit } from '@angular/core';
import { CaregiverService } from 'src/app/shared/services/caregiver.service';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  caregiverSearchForm: FormGroup;
  showBookBlock = false;
  caregiverList: any = [];
  pageNumber = 1;
  perPageRecord = 10;
  callMoreApi = true;
  dataToSend: any = {};
  servicesArray: any = [];
  locationList: any = [];
  experienceYears: any = [];
  showSelectedError = false;
  employerDetailsToShow: any = [];
  educationDetailsToShow: any = [];
  searchData: any = [];
  selectedCaregiver: any = [];
  clientSlug: any = '';
  careGiverType: any = [
    { id: 1, name: 'Registered Nurse' },
    { id: 2, name: 'Enrolled Nurse' },
    { id: 3, name: 'Health Worker' },
    { id: 4, name: 'Personal Care Worker' },
    { id: 5, name: 'Outpatient Escort Person' },
  ];
  maxDate: any;
  caregiverServiceFee: any = '';
  clientServiceFee: any = '';
  hoursDifference: any = 1;
  settingsServices = {};

  constructor(
    private caregiverService: CaregiverService,
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private router: ActivatedRoute,
    private route: Router,
  ) {
    this.dataToSend.recordPerPage = 10;
    this.dataToSend.pageNumber = 1;
    this.searchData = this.router.snapshot.paramMap.get('data');

    this.clientSlug = localStorage.getItem('slug');
  }

  ngOnInit(): void {
    this.getSystemSettings();
    const current = new Date();
    this.maxDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate(),
    };

    const iterationNUmber = 20;
    this.experienceYears = Array(iterationNUmber)
      .fill(1)
      .map((x, i) => i + 1);

    this.setSearchForm();
    this.getLocationList();
    if (this.searchData && this.searchData !== null) {
      this.searchData = JSON.parse(atob(this.searchData));
      if (
        this.searchData.caregiver_type &&
        this.searchData.caregiver_type !== ''
      ) {
        this.getSkills(this.searchData.caregiver_type);
      }
      this.caregiverSearchForm.patchValue(this.searchData);

      this.dataToSend = [];
      const tempArray: any = [];
      if (
        this.searchData.registration_no === '' ||
        this.searchData.registration_no === null
      ) {
        delete this.searchData.registration_no;
      }
      if (this.searchData.services.length > 0) {
        this.searchData.services.map((service: any) => {
          tempArray.push(service.id);
        });
      }
      this.searchData.services = tempArray;
      this.dataToSend = this.searchData;
      this.perPageRecord = 10;
      this.pageNumber = 1;
      const date = new Date(
        this.searchData.date.year,
        this.searchData.date.month - 1,
        this.searchData.date.day,
      );
      const formatedDated =
        date.getFullYear() +
        '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + date.getDate()).slice(-2);
      this.dataToSend.date = formatedDated;
      this.dataToSend.recordPerPage = this.perPageRecord;
      this.dataToSend.pageNumber = this.pageNumber;

      this.searchCaregiver();
    } else {
      if (this.callMoreApi === true) {
        this.searchCaregiver();
      }
    }
    this.settingsServices = {
      singleSelection: false,
      text: 'Select Services',
      lazyLoading: true,
      enableCheckAll: false,
      enableSearchFilter: false,
      badgeShowLimit: 2,
      searchPlaceholderText: 'Search Services',
      groupBy: 'type',
    };
  }
  onItemSelect(item: any) {
    this.searchInputChanged(item.id, 'services');
  }
  OnItemDeSelect(item: any) {
    this.searchInputChanged(item.id, 'services');
  }
  getSystemSettings() {
    this.caregiverService.getSystemSettings().subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.caregiverServiceFee = returnData.data[0].value;
          this.clientServiceFee = returnData.data[1].value;
        } else {
          this.caregiverServiceFee = 0;
          this.clientServiceFee = 0;
        }
      },
      err => {
        this.caregiverServiceFee = 0;
        this.clientServiceFee = 0;
      },
    );
  }
  open(content, data) {
    this.employerDetailsToShow = [];
    this.employerDetailsToShow = data;
    this.employerDetailsToShow.currentEmployer = {};
    this.employerDetailsToShow.previousEmployer = [];
    if (data.employer.length > 0) {
      data.employer.map((employerData: any) => {
        if (employerData.is_current_employer === '1') {
          this.employerDetailsToShow.currentEmployer = employerData;
        } else {
          this.employerDetailsToShow.previousEmployer.push(employerData);
        }
      });
    }
    if (
      this.employerDetailsToShow.currentEmployer &&
      this.employerDetailsToShow.currentEmployer !== ''
    ) {
      const currentDate = new Date();
      let inputDate: any;
      inputDate = new Date(
        this.employerDetailsToShow.currentEmployer.from_year,
        this.employerDetailsToShow.currentEmployer.from_month - 1,
        1,
      );
      let dy = currentDate.getFullYear() - inputDate.getFullYear();
      let dm = currentDate.getMonth() - inputDate.getMonth();
      let dd = currentDate.getDate() - inputDate.getDate();
      if (dd < 0) {
        dm -= 1;
        dd += 30;
      }
      if (dm < 0) {
        dy -= 1;
        dm += 12;
      }
      this.employerDetailsToShow.currentEmployer.yearsExperience = dy;
      this.employerDetailsToShow.currentEmployer.monthsExperience = dm;
    }
    if (this.employerDetailsToShow.previousEmployer.length > 0) {
      this.employerDetailsToShow.previousEmployer.map((previous: any) => {
        const currentDate = new Date(
          previous.to_year,
          previous.to_month - 1,
          1,
        );
        let inputDate: any;
        inputDate = new Date(previous.from_year, previous.from_month - 1, 1);
        let dy = currentDate.getFullYear() - inputDate.getFullYear();
        let dm = currentDate.getMonth() - inputDate.getMonth();
        let dd = currentDate.getDate() - inputDate.getDate();
        if (dd < 0) {
          dm -= 1;
          dd += 30;
        }
        if (dm < 0) {
          dy -= 1;
          dm += 12;
        }
        previous.yearsExperience = dy;
        previous.monthsExperience = dm;
      });
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'employee-modal',
      centered: true,
    });
  }
  openEducation(content, data) {
    this.educationDetailsToShow = [];
    this.educationDetailsToShow = data.education;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'employee-modal',
      centered: true,
    });
  }
  changeSorting(event, type) {
    this.dataToSend.recordPerPage = 10;
    this.dataToSend.pageNumber = 1;
    if (type === 'price') {
      this.dataToSend.orderBy = 'price';
      this.dataToSend.orderDir = event.target.value;
    } else if (type === 'experience') {
      this.dataToSend.orderBy = 'experience';
      this.dataToSend.orderDir = event.target.value;
    } else if (type === 'feedback') {
      this.dataToSend.orderBy = 'feedback';
      this.dataToSend.orderDir = event.target.value;
    }
    this.searchCaregiver();
  }
  setSearchForm() {
    this.caregiverSearchForm = this.formBuilder.group({
      registration_no: new FormControl('', [
        this.validationService.onlyNumber,
        this.validationService.trimValidator,
      ]),
      caregiver_type: new FormControl('', [Validators.required]),
      location_id: new FormControl('', []),
      date: new FormControl('', [Validators.required]),
      min_exp: new FormControl('', []),
      start_time: new FormControl('', [
        Validators.required,
        this.validationService.onlyNumber,
        this.validationService.trimValidator,
        this.validationService.onlyNumberTime,
      ]),
      start_meridian: new FormControl({ value: 'AM', disabled: false }, [
        Validators.required,
      ]),
      end_time: new FormControl('', [
        Validators.required,
        this.validationService.onlyNumber,
        this.validationService.trimValidator,
        this.validationService.onlyNumberTime,
      ]),
      end_meridian: new FormControl({ value: 'AM', disabled: false }, [
        Validators.required,
      ]),
      services: new FormControl('', [Validators.required]),
      // services: ['', []],
    });
  }
  searchInputChanged(event, field) {
    this.perPageRecord = 10;
    this.pageNumber = 1;
    this.dataToSend.recordPerPage = this.perPageRecord;
    this.dataToSend.pageNumber = this.pageNumber;

    if (field !== 'date' && field !== 'services') {
      this.dataToSend[`${field}`] = event.target.value;
    }
    if (field === 'start_time' || field === 'start_meridian') {
      if (
        this.caregiverSearchForm.value.start_time === '' ||
        this.caregiverSearchForm.value.start_time === null
      ) {
        this.toastr.error('Please enter Start Time');
      } else {
        if (
          this.caregiverSearchForm.value.start_time >= 0 &&
          this.caregiverSearchForm.value.start_time <= 12
        ) {
          if (this.caregiverSearchForm.value.start_meridian === 'AM') {
            this.dataToSend.start_time = String(
              this.caregiverSearchForm.value.start_time + ':00',
            );
          } else if (this.caregiverSearchForm.value.start_meridian === 'PM') {
            if (this.caregiverSearchForm.value.start_time === '12') {
              this.dataToSend.start_time = '23:59';
            } else {
              const time =
                Number(this.caregiverSearchForm.value.start_time) + 12;
              this.dataToSend.start_time = String(time + ':00');
            }
          }
        } else {
          this.caregiverSearchForm.controls.start_time.setErrors({
            serverError: 'Please enter hour between 0 to 12',
          });
          return false;
        }
      }
    }
    if (field === 'end_time' || field === 'end_meridian') {
      if (
        this.caregiverSearchForm.value.end_time === '' ||
        this.caregiverSearchForm.value.end_time === null
      ) {
        this.toastr.error('Please enter Start Time');
      } else {
        if (
          this.caregiverSearchForm.value.end_time >= 0 &&
          this.caregiverSearchForm.value.end_time <= 12
        ) {
          if (this.caregiverSearchForm.value.end_meridian === 'AM') {
            this.dataToSend.end_time = String(
              this.caregiverSearchForm.value.end_time + ':00',
            );
          } else if (this.caregiverSearchForm.value.end_meridian === 'PM') {
            if (this.caregiverSearchForm.value.end_time === '12') {
              this.dataToSend.end_time = '23:59';
            } else {
              const time = Number(this.caregiverSearchForm.value.end_time) + 12;
              this.dataToSend.end_time = String(time + ':00');
            }
          }
        } else {
          this.caregiverSearchForm.controls.end_time.setErrors({
            serverError: 'Please enter hour between 0 to 12',
          });

          return false;
        }
      }
    }
    if (field === 'services') {
      if (this.caregiverSearchForm.value.services.length > 0) {
        const tempArray: any = [];
        this.caregiverSearchForm.value.services.map((service: any) => {
          tempArray.push(service.id);
        });
        this.dataToSend.services = tempArray;
      } else {
        this.dataToSend.services = [];
      }
    }
    if (field === 'caregiver_type') {
      this.getSkills(event.target.value);
    }

    if (field === 'date') {
      const date = new Date(
        this.caregiverSearchForm.value.date.year,
        this.caregiverSearchForm.value.date.month - 1,
        this.caregiverSearchForm.value.date.day,
      );
      const formatedDated =
        date.getFullYear() +
        '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + date.getDate()).slice(-2);
      this.dataToSend.date = formatedDated;
    }

    if (
      field === 'start_time' ||
      field === 'start_meridian' ||
      field === 'end_meridian' ||
      field === 'end_time'
    ) {
      if (
        this.caregiverSearchForm.value.start_time !== '' &&
        this.caregiverSearchForm.value.end_time === ''
      ) {
        this.caregiverSearchForm.controls.end_time.setErrors({
          serverError: 'Please enter start and end time',
        });
        return false;
      } else if (
        this.caregiverSearchForm.value.start_time === '' &&
        this.caregiverSearchForm.value.end_time !== ''
      ) {
        this.caregiverSearchForm.controls.start_time.setErrors({
          serverError: 'Please enter start and end time',
        });

        return false;
      } else if (
        this.caregiverSearchForm.value.start_time === '' &&
        this.caregiverSearchForm.value.end_time === ''
      ) {
        return true;
      }
    }
    this.searchCaregiver();
  }
  getLocationList() {
    this.caregiverService.getLocationList().subscribe(
      (returnData: any) => {
        this.locationList = [];
        if (returnData.success === true) {
          if (returnData.data.length > 0) {
            returnData.data.map((mainLocation: any) => {
              if (mainLocation.subLocations.length > 0) {
                mainLocation.subLocations.map((location: any) => {
                  this.locationList.push(location);
                });
              }
            });
          }
        }
      },
      err => {
        console.error(err);
      },
    );
  }
  getSkills(type: any) {
    this.caregiverService.getSkills(type).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.servicesArray = [];
          if (returnData.data.length > 0) {
            returnData.data.map((skills: any) => {
              skills.type = '';
              if (skills.type === '1') {
                skills.type = 'Personal';
              } else if (skills.type === '2') {
                skills.type = 'Special';
              }
              skills.itemName = skills.english_title;
              this.servicesArray.push(skills);
              // if search data present
              if (this.searchData && this.searchData !== '') {
                const tempServiceArray: any = [];
                this.servicesArray.map((service: any) => {
                  if (this.searchData.services.indexOf(service.id) !== -1) {
                    tempServiceArray.push(service);
                  }
                });
                this.caregiverSearchForm.patchValue({
                  services: tempServiceArray,
                });
              }
            });
          }
        }
      },
      err => {
        console.error(err);
      },
    );
  }
  loadMore() {
    this.caregiverService.searchCaregiver(this.dataToSend).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          if (returnData.data.next && returnData.data.next !== null) {
            this.pageNumber = this.pageNumber + 1;
          } else {
            this.callMoreApi = false;
          }
          if (returnData.data.data.length > 0) {
            returnData.data.data.map((caregiver: any) => {
              if (caregiver.charges.length > 0) {
                const chargesObject = caregiver.charges.find(
                  x => x.hour === this.hoursDifference,
                );
                if (chargesObject && chargesObject !== undefined) {
                  caregiver.chargesObject = chargesObject;
                } else {
                  caregiver.chargesObject = caregiver.charges[0];
                }
              }
              caregiver.chargesObject.totalAmount = 0;
              const caregiverCharges = Number(
                Number(caregiver.chargesObject.price) *
                  Number(caregiver.chargesObject.hour),
              );
              caregiver.chargesObject.totalAmount = Number(
                Number(caregiverCharges) +
                  Number(this.clientServiceFee) +
                  Number(0),
              );
              caregiver.disabled = false;
              this.caregiverList.push(caregiver);
            });
          }
        }
      },
      err => {
        console.log(err);
      },
    );
  }
  searchCaregiver() {
    this.caregiverService.searchCaregiver(this.dataToSend).subscribe(
      (returnData: any) => {
        if (returnData.success === true) {
          this.showBookBlock = false;
          this.selectedCaregiver = [];
          if (returnData.data.next && returnData.data.next !== null) {
            this.dataToSend.pageNumber = this.dataToSend.pageNumber + 1;
          } else {
            this.callMoreApi = false;
          }
          this.caregiverList = returnData.data.data;

          if (this.caregiverList.length > 0) {
            this.caregiverList.map((careGiver: any) => {
              if (careGiver.charges.length > 0) {
                const chargesObject = careGiver.charges.find(
                  x => x.hour === this.hoursDifference,
                );
                if (chargesObject && chargesObject !== undefined) {
                  careGiver.chargesObject = chargesObject;
                } else {
                  careGiver.chargesObject = careGiver.charges[0];
                }
                careGiver.chargesObject.totalAmount = 0;
                const caregiverCharges = Number(
                  Number(careGiver.chargesObject.price) *
                    Number(careGiver.chargesObject.hour),
                );

                careGiver.chargesObject.totalAmount = Number(
                  Number(caregiverCharges) +
                    Number(this.clientServiceFee) +
                    Number(0),
                );
              }
              careGiver.disabled = false;
            });
          }
        }
      },
      err => {
        console.log(err);
      },
    );
  }
  public caregiverSearch() {
    console.log(this.caregiverSearchForm.value);
  }
  selectCaregiver(event) {
    if (this.selectedCaregiver.includes(event.target.value)) {
      this.selectedCaregiver.splice(
        this.selectedCaregiver.indexOf(event.target.value),
        1,
      );
    } else {
      this.selectedCaregiver.push(event.target.value);
    }
    if (this.selectedCaregiver.length > 0) {
      this.showBookBlock = true;
      if (this.selectedCaregiver.length >= 3) {
        this.caregiverList.map((caregiverData: any) => {
          if (this.selectedCaregiver.includes(String(caregiverData.id))) {
            caregiverData.disabled = false;
          } else {
            caregiverData.disabled = true;
          }
        });
      } else if (this.selectedCaregiver.length < 3) {
        this.caregiverList.map((caregiverData: any) => {
          caregiverData.disabled = false;
        });
      }
    } else {
      this.showBookBlock = false;
    }
  }
  bookCaregiver() {
    const callApi = true;
    if (!this.dataToSend.date || this.dataToSend.date === undefined) {
      this.toastr.error('Please select date to book caregiver');
      return false;
    } else if (
      !this.dataToSend.start_time ||
      this.dataToSend.start_time === undefined
    ) {
      this.toastr.error('Please select Start and End time to book caregiver');
      return false;
    } else if (
      !this.dataToSend.end_time ||
      this.dataToSend.end_time === undefined
    ) {
      this.toastr.error('Please select Start and End time to book caregiver');
      return false;
    } else if (
      !this.dataToSend.services ||
      this.dataToSend.services === undefined
    ) {
      this.toastr.error('Please select services to book caregiver');
      return false;
    } else {
      if (this.clientSlug && this.clientSlug !== null) {
        if (this.selectedCaregiver.length > 3) {
          this.toastr.error('Please select up to 3 Caregivers ');
          return false;
        } else {
          if (callApi) {
            const dataToSend: any = {};
            dataToSend.slug = this.clientSlug;
            dataToSend.date = this.dataToSend.date;
            if (this.dataToSend.start_meridian === 'AM') {
              this.dataToSend.start_time = String(
                this.dataToSend.start_time + ':00',
              );
            } else if (this.dataToSend.start_meridian === 'PM') {
              if (this.dataToSend.start_time === '12') {
                this.dataToSend.start_time = '23:59';
              } else {
                const time = Number(this.dataToSend.start_time) + 12;
                this.dataToSend.start_time = String(time + ':00');
              }
            }
            if (this.dataToSend.end_meridian === 'AM') {
              this.dataToSend.end_time = String(
                this.dataToSend.end_time + ':00',
              );
            } else if (this.dataToSend.end_meridian === 'PM') {
              if (this.dataToSend.end_time === '12') {
                this.dataToSend.end_time = '23:59';
              } else {
                const time = Number(this.dataToSend.end_time) + 12;
                this.dataToSend.end_time = String(time + ':00');
              }
            }
            dataToSend.start_time = this.dataToSend.start_time;
            dataToSend.end_time = this.dataToSend.end_time;
            dataToSend.services = this.dataToSend.services;
            dataToSend.duration = Number(
              Number(this.caregiverSearchForm.value.end_time) -
                Number(this.caregiverSearchForm.value.start_time),
            );
            dataToSend.caregiver = [];
            this.selectedCaregiver.map((selected: any) => {
              const matched: any = this.caregiverList.filter(
                x => Number(x.id) === Number(selected),
              )[0];

              if (matched && matched !== undefined) {
                const tempArray: any = {};
                tempArray.caregiver_id = matched.id;
                tempArray.caregiver_charges = Number(
                  matched.chargesObject.price * matched.chargesObject.hour,
                );
                tempArray.total_amount =
                  Number(matched.chargesObject.price * dataToSend.duration) +
                  Number(
                    matched.chargesObject.price * dataToSend.duration * 1,
                  ) /
                    100;
                tempArray.caregiver_charges_hour = dataToSend.duration;
                tempArray.caregiver_charges_price = matched.chargesObject.price;
                tempArray.caregiver_service_fee = this.caregiverServiceFee;
                tempArray.client_service_fee = this.clientServiceFee;
                dataToSend.caregiver.push(tempArray);
              }
            });
            this.caregiverService.addBooking(dataToSend).subscribe(
              (returnData: any) => {
                console.log(returnData);
              },
              err => {
                console.log(err);
              },
            );
          }
        }
      } else {
        this.toastr.error('Please login to book caregiver');
        const stringToSend = btoa(
          JSON.stringify(this.caregiverSearchForm.value),
        );
        this.route.navigate([`/auth/client-login/${stringToSend}`]);
      }
    }
  }
}
