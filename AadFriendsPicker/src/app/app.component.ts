import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { AuthenticationResult } from "@azure/msal-browser";

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types"
import { environment } from "src/environments/environment";

interface IODataResult<T> {
    value: T;
}

class AddFriendModel {
    constructor(private friendId: string) { }
}

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styles: [],
})
export class AppComponent implements OnInit {

    loggedIn = false;
    profile!: MicrosoftGraph.User;
    userSearchFilter: string = "";
    addFriendSearchFilter: string = "";
    users!: MicrosoftGraph.User[];
    friends: Array<MicrosoftGraph.User> = new Array<MicrosoftGraph.User>();
    friendIds!: any;

    constructor(private authService: MsalService, private client: HttpClient) {}

    ngOnInit(): void {
        this.checkAccount();
    }

    async checkAccount() {
        if (this.authService.instance.getAllAccounts().length > 0) {
            this.profile = await this.getProfileInformation();
            await this.updateFriends();
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

    async updateUsers(searchFilter: string) {
        let params = new HttpParams().set("$top", "10");
        if (this.userSearchFilter) {
          params = params.set(
            "$filter",
            `startsWith(displayName, '${searchFilter}')`
          );
        }
        let url = `https://graph.microsoft.com/v1.0/users?${params.toString()}`;
        this.users = (await this.client.get<IODataResult<MicrosoftGraph.User[]>>(url).toPromise()).value;
    }

    private async lookupUser(userId: string): Promise<MicrosoftGraph.User>
    {
        let url = `https://graph.microsoft.com/v1.0/users/${userId}`;
        return (await this.client.get<MicrosoftGraph.User>(url).toPromise());
    }

    async updateFriends() {
        // Retrieve all friend ids
        this.friendIds = await this.client.get<string[]>(environment.customApi + "/getAll").toPromise();
        
        // Clear all previously looked up friends
        if (this.friends != null)
            this.friends.length = 0; 

        // Lookup each id with their corresponding name
        for (const friendId of this.friendIds) {
            if (friendId != null) {
                let userData = await this.lookupUser(friendId);
                this.friends.push(userData);
            }
        }
    }
    
    async addFriend(user: MicrosoftGraph.User) {
        var model = new AddFriendModel(user!.id!.toString());
        this.friendIds = await this.client.post<AddFriendModel>(environment.customApi + "/add", model).toPromise();
        this.userSearchFilter = "";
        await this.updateFriends();
    }

    public isFriend(user: MicrosoftGraph.User): boolean {
        return this.friendIds != null && this.friendIds.indexOf(user!.id) != -1;
    }
}
