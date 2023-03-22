
export type TPoliciesCB<T> = {
    data: T,
    action: ECrudActions
}

export enum ECrudActions {
    reIssue = 'reIssue',
    update = 'update',
    add = 'add',
    delete = 'delete',
    remove = 'remove'
} 