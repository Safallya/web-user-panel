import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'app/services/firebase.service';
import { Product } from 'app/utils/types';
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'app/components/dialog/dialog.component';
import { MsgHelperService } from 'app/services/msg-helper.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  loadingProducts: boolean;
  search = "";
  constructor(
    private fb: FirebaseService,
    private dialog: MatDialog,
    private msgHelper: MsgHelperService
  ) { }
  get filteredProducts() {
    return this.search ? this.products.filter(product => product.name.includes(this.search)) : this.products;
  }

  async ngOnInit() {
    this.loadingProducts = true;
    try {
      const products = await this.fb.getProducts();
      this.products = products;
    } catch (e) {
      console.log(e);
    }
    this.loadingProducts = false;
  }
  addOrEditProduct(entryType: 'ADD' | 'EDIT' = 'ADD', product?: Product) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        product: product || null,
        entryType,
      },
    });
    dialogRef.afterClosed().subscribe(ret => {
      if (ret) {
        this.ngOnInit();
      }
    });
  }
  async deleteProduct(product: Product) {
    const { value } = await this.msgHelper.showConfirm(`Are you sure want to delete ${product.name}`);
    if (value) {
      try {
        await this.fb.deleteProduct(product.uid);
        this.ngOnInit();
        this.msgHelper.showToast('success', `${product.name} deleted successfully`);
      } catch {
        this.msgHelper.showToast('error', 'Failed to delete product, please try again later');
      }
    }
  }
}
