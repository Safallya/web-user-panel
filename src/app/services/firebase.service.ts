import { Injectable } from '@angular/core';
import {
  Auth,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from '@firebase/firestore';
import { Product, User } from 'app/utils/types';
import { environment } from 'environments/environment';
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  userData: any;
  isFirebaseReady: boolean;
  isFirebaseRunning: boolean;
  fireStore: any = null;
  private fbAuth: Auth;
  constructor(
    private events: EventsService
  ) {
    this.initializeFirebase();
  }
  
  async initializeFirebase(): Promise<boolean | void> {
    this.isFirebaseRunning = true;
    this.isFirebaseReady = false;
    const app = initializeApp(environment.firebaseConfig);
    this.fireStore = getFirestore(app);
    this.fbAuth = getAuth();
    this.isFirebaseReady = true;
    return this.isFirebaseReady;
  }
  async signInUsingEmail(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(
      this.fbAuth,
      email,
      password,
    );
  }
  async registerUser(email: string, password: string): Promise<UserCredential> {
    return await createUserWithEmailAndPassword(
      this.fbAuth,
      email,
      password
    );
  }
  async signOut(): Promise<void> {
    return await signOut(this.fbAuth);
  }
  setUserData(user: User): Promise<any> {
    return addDoc(collection(this.fireStore, 'userTable'), user);
  }
  async addProduct(product: Product): Promise<any> {
    return addDoc(collection(this.fireStore, 'products'), product);
  }
  async getProducts(): Promise<Product[]> {
    const products: Product[] = [];
    try {
      const docRef = collection(this.fireStore, 'products');
      const queryCmd = query(docRef, where("createdBy", "==", this.events.currentUser.email));
      const docSnap = await getDocs(queryCmd);
      docSnap.forEach((doc) => {
        const product = JSON.parse(JSON.stringify(doc.data()));
        product.uid = doc.id;
        products.push(product);
      });
    } catch { }
    return products;
  }
  async deleteProduct(uid: string): Promise<void> {
    return await deleteDoc(doc(this.fireStore, "products", uid));
  }
  async updateProduct(product: Product, uid: string) {
    const docRef = doc(this.fireStore, 'products', uid);
    return await updateDoc(docRef, {
      name: product.name,
      image: product.image,
      price: product.price,
      offerPrice: product.offerPrice
    });
  }
}
