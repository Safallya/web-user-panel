import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EventsService } from "app/services/events.service";
import { FirebaseService } from "app/services/firebase.service";
import { MsgHelperService } from "app/services/msg-helper.service";
import { UserInfo } from "firebase/auth";

declare interface UserEntry {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  running = false;
  validationMsg = {
    email: [{
        type: 'required',
        message: 'Email ID is required'
      }, {
        type: 'minlength',
        message: 'Email ID should be more than two characters',
      }, {
        type: 'invalid',
        message: 'Invalid Email ID',
      },
    ],
    password: [{
        type: 'required',
        message: 'Password is required'
      }, {
        type: 'minlength',
        message: 'Password must contain at least 5 digits',
      }
    ],
  };

  constructor(
    private fb: FirebaseService,
    private router: Router,
    private eventsService: EventsService,
    private formBuilder: FormBuilder,
    private msgHelper: MsgHelperService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          (data) => {
            const input = data.value;
            const isInputEmail =
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                input
              );
            if (!isInputEmail) {
              return { invalid: true };
            }
          },
        ],
      ],
      password: ["", [Validators.required, Validators.minLength(5)]],
    });
  }
  async signIn() {
    if (this.loginForm.valid) {
      this.running = true;
      const { email, password } = this.loginForm.value;
      try {
        const resp = await this.fb.signInUsingEmail(email, password);
        await this.storeUserDetails(resp.user);
        this.router.navigateByUrl("products");
        this.msgHelper.showToast('success', `Welcome, ${resp.user.email}`);
      } catch (e) {
        const errMsg = e.code.split('/')[1];
        if (errMsg === 'user-not-found') {
          this.msgHelper.showToast('error', 'User not found! Create an account to login');
          this.router.navigateByUrl('create-account');
        } else {
          this.msgHelper.showToast('error', 'Failed to login, please try again later');
        }
      }
      this.running = false;
    } else {
      Object.keys(this.loginForm.controls).forEach((field) => {
        this.loginForm.get(field).markAsTouched();
      });
    }
  }
  async storeUserDetails(user: UserInfo): Promise<void> {
    const currentUser = {
      name: user.displayName,
      email: user.email,
    };
    const userObj = currentUser;
    await this.fb.setUserData(userObj);
    this.eventsService.currentUser = userObj;
  }
  routeToCreateAccount() {
    this.router.navigateByUrl('create-account');
  }
}
