import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EventsService } from "app/services/events.service";
import { FirebaseService } from "app/services/firebase.service";
import { MsgHelperService } from "app/services/msg-helper.service";

@Component({
  selector: "app-create-account",
  templateUrl: "./create-account.component.html",
  styleUrls: ["./create-account.component.css"],
})
export class CreateAccountComponent implements OnInit {
  registerForm: FormGroup;
  validationMsg = {
    name: [
      {
        type: "required",
        message: "Name is required",
      },
      {
        type: "minlength",
        message: "Name should be more than two characters",
      },
    ],
    email: [
      {
        type: "required",
        message: "Email ID is required",
      },
      {
        type: "minlength",
        message: "Email ID should be more than two characters",
      },
      {
        type: "invalid",
        message: "Invalid Email ID",
      },
    ],
    password: [
      {
        type: "required",
        message: "Password is required",
      },
      {
        type: "minlength",
        message: "Password must contain at least 5 digits",
      },
    ]
  };
  running = false;

  constructor(
    private fb: FirebaseService,
    private router: Router,
    private formBuilder: FormBuilder,
    private events: EventsService,
    private msgHelper: MsgHelperService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
      ]],
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
              return {
                invalid: true,
              };
            }
          },
        ],
      ],
      password: ["", [Validators.required, Validators.minLength(5)]]
    });
  }
  async signUp() {
    if (this.registerForm.valid) {
      this.running = true;
      const { name, email, password } = this.registerForm.value;
      try {
        const userRep = (await this.fb.registerUser(email, password)).user;
        const currentUser = {
          name,
          email: userRep.email,
        };
        await this.fb.setUserData(currentUser);
        this.events.currentUser = currentUser;
        this.router.navigateByUrl('products');
      } catch {
        this.msgHelper.showToast("error", "Failed to Create Account, please try again later");
      }
      this.running = false;
    } else {
      Object.keys(this.registerForm.controls).forEach((field) => {
        this.registerForm.get(field).markAsTouched();
      });
    }
  }
  routeToLogin() {
    this.router.navigateByUrl('login');
  }
}
