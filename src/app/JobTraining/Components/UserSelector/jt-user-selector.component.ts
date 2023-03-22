import { Component, OnInit, Input, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { isNullOrUndefined } from 'is-what';
import { RoleInfo, ProgramUserInfo } from '../../Providers/Model';

// define component
@Component({
    selector: 'jt-user-selector-component',
    templateUrl: 'jt-user-selector.component.html',
    styleUrls: [
        '../../page.scss',
        'jt-user-selector.component.scss'
    ]
})

/** This component is for the JobTraining header with ion back and menu button */
export class JTUserSelectorComponent implements OnInit {
    constructor() { }

    @Input() roles: RoleInfo[];
    @Input() users: ProgramUserInfo[];
    @Input() preSelectedUserID: number;

    //when a new user is selected, this emitter signals such
    @Output() onUserSelected: EventEmitter<number> = new EventEmitter();

    public hasUsers: boolean;
    public selectedUserID: number;

    public showRoleFilter: boolean;
    public filterToRoleIDs: number[] = [];

    public showSearchBox: boolean;
    public filterByText: string = '';

    public emitSelectedUser() {
        this.onUserSelected.emit(this.selectedUserID);
    }

    ngOnInit() {
        this.selectedUserID = this.preSelectedUserID;

        this.hasUsers = this.users.length > 0;
        if (this.hasUsers) {
            if (this.users.length > 5) {
                this.showSearchBox = true;
                /**
                 * [roles] isn't ALWAYS passed in, like when it's just a "Trainee User Selector" scenario.
                 * We'll show the role selector if it was passed in, and if there is more than one
                 * role to filter by.
                 */
                if (!isNullOrUndefined(this.roles) && this.roles.length > 1) {
                    this.showRoleFilter = true;
                }
            }
        }
    }
}

@Pipe({
    name: 'JTUserSelectorFilter'
})
export class JTUserSelectorFilterPipe implements PipeTransform {
    transform(users: ProgramUserInfo[], filterByText: string, filterToRoleIDs: number[]): any[] {
        if (!users) return [];
        var hasSearchText = filterByText !== '';
        var hasRoles = filterToRoleIDs.length > 0;
        if (!hasSearchText && !hasRoles) {
            return users;
        }
        else {
            filterByText = filterByText.toLowerCase();
            return users.filter(loopedUser => {
                var hasTextMatch = false;
                if (hasSearchText) {
                    hasTextMatch = (
                        loopedUser.DisplayName.toLowerCase().includes(filterByText)
                        ||
                        loopedUser.AcadisID.toLowerCase().includes(filterByText)
                    );
                }
                else {
                    hasTextMatch = true; // We don't have text to filter by, so we can just fallback to true.
                }
                var hasRoleMatch = false;
                if (hasRoles) {
                    loopedUser.RoleIDs.forEach(loopedUserRoleID => {
                        hasRoleMatch = ((filterToRoleIDs.indexOf(loopedUserRoleID) !== -1) || hasRoleMatch);
                    });
                }
                else {
                    hasRoleMatch = true; // We don't have roles to filter by, so we can just fallback to true.
                }

                return hasTextMatch && hasRoleMatch;
            });
        }
    }
}