import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EventsService } from 'app/services/events.service';
import { FirebaseService } from 'app/services/firebase.service';
import { MsgHelperService } from 'app/services/msg-helper.service';
import { Product } from 'app/utils/types';
import { Observable, ReplaySubject } from 'rxjs';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  addProductForm: FormGroup;
  validationMsg = {
    name: [
      {
        type: "required",
        message: "Product Name is required",
      },
      {
        type: "minlength",
        message: "Product Name should be more than two characters",
      },
    ],
    price: [
      {
        type: "required",
        message: "Product Price is required",
      }
    ],
    offerPrice: [
      {
        type: "required",
        message: "Product Offer Price is required",
      },
    ],
  };
  imageDataURI: string | null = null;
  currentProduct: Product;
  saveOrEditRunning = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {product: Product, entryType: string},
    private formBuilder: FormBuilder,
    private fb: FirebaseService,
    private dialog: MatDialogRef<DialogComponent>,
    private events: EventsService,
    private msgHelper: MsgHelperService,
  ) {
    this.addProductForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
      ]],
      price: [0, [Validators.required]],
      offerPrice: [0, [Validators.required]],
    });
  }

  ngOnInit() {
    if (this.data.product) {
      this.currentProduct = this.data.product;
      this.imageDataURI = this.currentProduct.image;
      Object.keys(this.addProductForm.controls).forEach(field => {
        this.addProductForm.get(field).setValue(this.currentProduct[field]);
      });
    }
  }
  onFileSelected(event) {
    this.convertFile(event.target.files[0]).subscribe(uri => {
      this.imageDataURI = uri;
    });
  }
  convertFile(file: File) {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (evt) => result.next(
      evt.target.result.toString()
    );
    return result;
  }
  async saveOrEdit() {
    if (this.addProductForm.valid) {
      this.saveOrEditRunning = true;
      const entryType = this.data.entryType;
      const { name, price, offerPrice } = this.addProductForm.value;
      if (this.imageDataURI === null) {
        this.saveOrEditRunning = false;
        this.msgHelper.showToast('warning', 'Please set Product Image');
        return;
      }
      const productObj = {
        name,
        image: this.imageDataURI,
        price,
        offerPrice,
        createdBy: this.events.currentUser.email
      };
      if (entryType === 'ADD') {
        await this.fb.addProduct(productObj);
      } else if (entryType === 'EDIT') {
        await this.fb.updateProduct(productObj, this.currentProduct.uid);
      }
      this.dialog.close(true);
      this.msgHelper.showToast('success', `Product ${entryType === 'ADD' ? 'added' : 'modified'} successfully to your list`);
      this.saveOrEditRunning = false;
    } else {
      Object.keys(this.addProductForm.controls).forEach(field => {
        this.addProductForm.get(field).markAsTouched();
      });
    }
  }
}
