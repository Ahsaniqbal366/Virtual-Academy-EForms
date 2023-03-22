import { SafeHtml } from '@angular/platform-browser';
import { KeywordDictionaryInfo } from 'src/app/shared/Utilities/keyword-dictionary.model';

export const ANNOUNCEMENT_COMMENT_MAX_CHARS = 1000;

export class AnnouncementServerInfo {
    UserPermissions: AnnouncementsUserPermissionsServerInfo;
    SelectiveAnnouncements: SelectiveAnnouncementsServerInfo;
    UserProfilePicturePath: string;
}

export class AnnouncementsUserPermissionsServerInfo {
    /**
     * [CanFilterToFutureAnnouncements]
     * ----
     * We decided that all users can filter announcements, but not all users can see all filter types.
     */
    CanFilterToFutureAnnouncements: boolean;
    CanAddAnnouncements: boolean;
    CanEditAllAnnouncements: boolean;
    CanEditAllAnnouncementComments: boolean;
}

export class SelectiveAnnouncementsServerInfo {

    SelectiveAnnouncementsEnabled: boolean;

    CanSelectDistricts: boolean;
    Districts: SelectiveAnnouncementsDatasourceInfo[];

    CanSelectRoles: boolean;
    Roles: SelectiveAnnouncementsDatasourceInfo[];

    CanSelectTags: boolean;
    Tags: SelectiveAnnouncementsDatasourceInfo[];
    TagKeyword: KeywordDictionaryInfo;
}


export class SelectiveAnnouncementsDatasourceInfo {
    Name: string;
    ID: number;
}

export class AnnouncementInfo {
    AnnouncementID: number;
    Title: string;
    Description: string;
    Category: string;

    CreatedByUserInfo: AnnouncementUserInfo;

    PublishDate: Date;
    ExpireDate: Date;

    /**
     * [NotifyUsers] isn't a DB column. It's used to let the user optionally
     * not message the recipients when posting an announcement.
     */
    NotifyUsers: boolean;

    AllowReactions: boolean;
    AllowComments: boolean;

    LikeReactionCount: number;
    NeutralReactionCount: number;
    DislikeReactionCount: number;

    // [UserReactionType] holds the name of the user's chosen reaction type. Might be an empty string.
    UserReactionType: string;

    CommentCount: number;

    /**
     * [CanEditAnnouncement] & [CanDeleteAnnouncement] are permissions flags returned by API.
     * Varies from user to user.
     */
    CanEditAnnouncement: boolean;
    CanDeleteAnnouncement: boolean;

    // [Comments] isn't part of the initial announcements data gather, but will get cached here if the user
    // chooses to view/add/edit the announcement record's comments.
    Comments: AnnouncementCommentInfo[];

    GUIData: AnnouncementGUIData;
    constructor() {
        this.Description = '';
    }
}

export class AnnouncementUserInfo {
    FullName: string;
    ProfilePicture: string;
}

export class AnnouncementGUIData {
    SafeHTMLContent: SafeHtml;
    /**
     * [ShowCommentsContainer] is to control visibility of the announcements comment in the GUI.
     * This container is hidden by default. User can click to open/close the container.
     */
    ShowCommentsContainer: boolean;
    // [IsLoadingComments] controls visibility of a loading indicator in the GUI while comments load.
    IsLoadingComments: boolean;
    /**
     * [FailedToLoadComments] pairs with [CommentsErrorMessage] to control visibility of a warning
     * indicator in the GUI.
     */
    FailedToLoadComments: boolean;
    CommentsErrorMessage: string;

    /**
     * [CommentsCountMessage] shows a string like... "0 Comments" or "1 Comment".
     * It gets it's own variable because we have to do the singular/plural logic.
     */
    CommentsCountMessage: string;

    /**
     * [NewCommentInfo] is the ngModel for the new comment textarea.
     * We have to have one for each announcement on the page because they can all have their own
     * comments region.
     */
    NewCommentInfo: AnnouncementCommentInfo;
}

export class AnnouncementCommentGUIData {
    /**
     * [IsDefaultCommentInfo] is used as the ngModel for the "new comment" textarea at the top
     * of the announcement comments region.
     */
    IsDefaultCommentInfo: boolean;

    // [IsSaving] flag controls visibility of a loading indicator in the GUI.
    IsSaving: boolean;

    // [IsDeleting] flag controls visibility of a loading indicator in the GUI.
    IsDeleting: boolean;

    // [IsEditing] controls visibility of the edit comment textarea in the GUI.
    IsEditing: boolean;

    // [ShowActionButtons] controls visibility of Reply/Edit/Delete action buttons in the GUI.
    ShowActionButtons: boolean;

    constructor() {
        this.IsDefaultCommentInfo = false;

        this.IsSaving = false;
        this.IsDeleting = false;

        this.IsEditing = false;

        // Show action buttons by default. The buttons still won't be available if edit permissions forbid it.
        this.ShowActionButtons = true;
    }
}

export class AnnouncementCommentInfo {
    CommentID: number;
    AnnouncementID: number;
    ParentCommentID: number;
    CommenterID: number;
    CommentDateCreated: Date;
    CommentDateUpdate: Date;
    UpdatedBy: number;
    Comment: string;
    IsDeleted: boolean;

    IsReply: boolean;

    // [CanEditComment] shows if the current user can edit the given [AnnouncementCommentInfo].
    CanEditComment: boolean;

    // [CanReplyToComment] shows if the current user can reply to the given [AnnouncementCommentInfo].
    CanReplyToComment: boolean;

    GUIData: AnnouncementCommentGUIData;

    CommenterUserInfo: AnnouncementUserInfo;

    constructor() {
        this.GUIData = new AnnouncementCommentGUIData();
    }
}

export class DeleteAnnouncementCommentOutputPackage {
    /**
     * An updated [AnnouncementCommentInfo] will be returned after the delete to clean up any necessary
     * permissions flags, redacted data, etc.
     */
    Comment: AnnouncementCommentInfo;
    DeletedSuccessfully: boolean;
    DeleteErrorMessage: string;
}
