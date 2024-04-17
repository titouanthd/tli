interface Author {
    id: number;
    username: string;
    name: string;
    state: string;
    locked: boolean;
    avatar_url: string;
    web_url: string;
}

interface Note {
    id: number;
    type: string;
    body: string;
    attachment: null;
    author: Author;
    created_at: string;
    updated_at: string;
    system: boolean;
    noteable_id: number;
    noteable_type: string;
    project_id: number;
    commit_id: null;
    position: null;
    resolvable: boolean;
    resolved: boolean;
    resolved_by: null;
    resolved_at: null;
    confidential: boolean;
    internal: boolean;
    noteable_iid: number;
    commands_changes: any;
}

interface PushData {
    action: string;
    commit_title: string;
    ref: string;
    ref_type: string;
    commit_from: string;
    commit_to: string;
    commit_count: number;
    ref_count: string | null;
}

interface GitlabUserEvent {
    id: number;
    project_id: number;
    action_name: string;
    target_id: number;
    target_iid: number;
    target_type: string;
    author_id: number;
    target_title: string;
    created_at: string;
    author_username: string;
    author: Author;
    push_data: PushData | undefined;
    note: Note | undefined;
}

export default interface GitlabUserEventResponse extends Array<GitlabUserEvent> {}

export { Author, Note, PushData, GitlabUserEvent };
