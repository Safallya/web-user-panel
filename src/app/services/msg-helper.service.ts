import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: true,
  confirmButtonText: 'Close',
  confirmButtonColor: 'primary',
  timer: 3000,
  timerProgressBar: true,
});
@Injectable({
  providedIn: 'root'
})
export class MsgHelperService {
  constructor() { }

  showToast(icon, msg) {
    return Toast.fire({
      icon,
      text: msg,
    });
  }
  showConfirm(text) {
    return Swal.fire({
      toast: true,
      titleText: 'Are you sure?',
      text,
      icon: 'warning',
      position: 'bottom-end',
      showCancelButton: true,
      confirmButtonColor: '#004581',
      cancelButtonColor: '#c10015',
      confirmButtonText: 'Confirm',
    });
  }
}
