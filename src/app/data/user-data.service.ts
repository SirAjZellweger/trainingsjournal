import { Injectable, inject } from "@angular/core";
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { AuthService } from "../auth/auth.service";
import { Observable, from, map, of, switchMap, tap } from "rxjs";
import { UserData } from "./interfaces/user-data";

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly db = inject(AngularFirestore);
  private readonly authService = inject(AuthService);
  
  // public getUserData(): Observable<QueryDocumentSnapshot<UserData>> {
  //   return this.authService.user$.pipe(
  //     switchMap(user => this.db.collection('users').doc<UserData>(user?.uid).ref.get()),
  //     switchMap(userData => userData.exists ? of(userData) : this.createUserData())
  //   )
  // }

  public getUserData(): Observable<AngularFirestoreDocument<UserData>> {
    return this.authService.user$.pipe(
      map(user => this.db.collection('users').doc<UserData>(user?.uid)),
    )
  }

  public createUserData(): Observable<AngularFirestoreDocument<UserData>> {
    return this.authService.user$.pipe(
      switchMap(user => from(this.db.collection<UserData>('users').doc(user?.uid).set({
        foo: true,
      })).pipe(
          map(() => user)
        )
      ),
      map(user => this.db.collection('users').doc<UserData>(user?.uid)),
    );
  }

  public deleteUserData(): Observable<void> {
    return this.getUserData().pipe(
      switchMap(user => user.ref.delete()),
    );
  }
}