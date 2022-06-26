import { Component, OnInit } from '@angular/core';
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  static menuRoutes: RouteInfo[] = [
    { path: '/products', title: 'Products',  icon: 'dashboard', class: '' },
  ];

  constructor() { }

  ngOnInit() {
    this.menuItems = SidebarComponent.menuRoutes.filter(menuItem => menuItem);
  }
}
