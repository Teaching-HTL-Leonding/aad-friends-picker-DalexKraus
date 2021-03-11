import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { AuthenticationResult } from "@azure/msal-browser";

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types"

interface IODataResult<T> {
    value: T;
}

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styles: [],
})
export class AppComponent implements OnInit {

    loggedIn = false;
    profile!: MicrosoftGraph.User;

    userSearchFilter: String = "";
    users!: MicrosoftGraph.User[];

    constructor(private authService: MsalService, private client: HttpClient) {}

    ngOnInit(): void {
        this.checkAccount();
    }

    async checkAccount() {
        if (this.authService.instance.getAllAccounts().length > 0) {
            this.profile = await this.getProfileInformation();
            this.loggedIn = true;
        }
    }

    login() {
        this.authService
            .loginPopup()
            .subscribe((response: AuthenticationResult) => {
                this.authService.instance.setActiveAccount(response.account);
                this.checkAccount();
            });
    }

    logout() {
        this.authService.logout();
    }

    async getProfileInformation(): Promise<any> {
        return await this.client.get("https://graph.microsoft.com/v1.0/me").toPromise();
    }

    getUsers() {
        let params = new HttpParams().set("$top", "10");
        if (this.userSearchFilter) {
          params = params.set(
            "$filter",
            `startsWith(displayName, '${this.userSearchFilter}')`
          );
        }
        let url = `https://graph.microsoft.com/v1.0/users?${params.toString()}`;
        this.client
          .get<IODataResult<MicrosoftGraph.User[]>>(url)
          .subscribe((users) => (this.users = users.value));
      }
}