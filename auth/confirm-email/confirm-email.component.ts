import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from 'src/app/shared/services/auth-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
})
export class ConfirmEmailComponent implements OnInit {
  token: any = '';
  update: any = '';
  returnData: any = {};
  usertype: any = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthServiceService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.update = this.route.snapshot.queryParamMap.get('update');
    const data: any = {};
    data.token = this.token;
    if (this.update && this.update !== null) {
      data.update = this.update;
    }
    this.authService.confirmEmail(data).subscribe((returnData: any) => {
      if (returnData.success === true) {
        this.returnData = returnData;
        localStorage.setItem('usertype', returnData.data.user_type);
        // this.toastr.success(returnData.message);
      } else if (returnData.success === false) {
        this.toastr.error(returnData.message);
      }
    });
  }
  redirection() {
    this.usertype = localStorage.getItem('usertype');
    if (this.usertype === '2') {
      this.router.navigateByUrl('/auth/caregiver-login');
    } else if (this.usertype === '3') {
      this.router.navigateByUrl('/auth/client-login');
    } else if (this.usertype === '1') {
      console.log('admin');
    } else {
      this.router.navigateByUrl('/auth/caregiver-login');
    }
  }
}
