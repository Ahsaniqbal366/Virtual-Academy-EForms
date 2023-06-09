import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIBaseService } from "../../shared/API.Base.Service";
import { HttpClient } from "@angular/common/http";
import { API_URLS } from "src/environments/environment";
import { APIResponse } from 'src/app/shared/API.Response.Model';
import { Router } from '@angular/router';

const _apiRoot = API_URLS.Authentication;
const _ticketURL = API_URLS.Ticket;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // initialize the service provider.
  constructor(
    private apiBaseService: APIBaseService,
    private http: HttpClient,
    private router: Router
  ) {}
  /* Signin a user using api */
  signin(username: string, password: string): Observable<object> {
    const apiCallData = {
      userName: username,
      password,
    };

    // make the POST call to log in a user
    return this.apiBaseService.post(
      _apiRoot,
      "authentication/login",
      JSON.stringify(apiCallData)
    );
  }
  /**
   * Sign out a user(destroy jwt)
   */
  signout():void{
    //destroy the jwt
    this.apiBaseService.destroyJWTAccessToken();
    //return to signin
    this.router.navigate(["/signin"]);
  }

  /*
    JLP Call this to validate JWT on every page
  */
  JWTIsValid(): Observable<object> {
    //if the jwt token isn't an empty string, then lets validate it against the api
    if (this.apiBaseService.getJWTAccessToken(false).length > 0) {
      return this.apiBaseService.post(
        _apiRoot,
        "authentication/IsSignedIn",
        null
      );
      //else we just return false(its bad anyways)
    } else {
      return new Observable<any>((subscriber) => {
        subscriber.next(false);
        subscriber.complete();
      });
    }
  }
  /*
    Create a username ticket. NOT IN USE AT THIS TIME
  */
  createUsernameTicket(
    name: string,
    email: string,
    state: string,
    phone: string
  ): Observable<any> {
    return this.createTicket(
      name,
      email,
      state,
      phone,
      "Username Request",
      "This is an autogenerated ticket for a user requesting their login credentials. Their state is: " +
        state
    );
    /* returns boolean (not used) */
  }
  /* create a standard ticket */
  createTicket(
    name: string,
    email: string,
    state: string,
    phone: string,
    subject: string,
    description: string
  ): Observable<any> {
    return this.http.post(_ticketURL, {
      ticket: {
        phone: phone,
        status: "new",
        priority: "normal",
        type: "problem",
        tags: "['virtual_academy']",
        subject: subject,
        description: description,
        requester: {
          name: name,
          email: email,
        },
        comment: {
          body: description,
        },
        custom_fields: [
          {
            //this is hardcoded for now
            id: "21159038",
            value: phone,
          },
        ],
      },
    });
  }
}
