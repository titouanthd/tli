import IGitlabUserResponse from './interfaces/IGitlabUserResponse';
import {
    GITLAB_BRANCHES_ENDPOINT,
    GITLAB_MERGE_REQUESTS_ENDPOINT,
    GITLAB_SEARCH_MERGE_REQUESTS_ENDPOINT,
    GITLAB_USER_ENDPOINT,
    GITLAB_USER_EVENTS_ENDPOINT,
} from '../globals/AppConstants';
import GitlabUserEventResponse from './interfaces/GitlabUserEventResponse';
import IGitlabBranchesResponse from './interfaces/IGitlabBranchesResponse';

export default class GitlabApiClient {
    private readonly token: string | undefined;
    constructor(token?: string) {
        this.token = token;
    }

    public async getUser(): Promise<IGitlabUserResponse | void> {
        try {
            const response = await fetch(GITLAB_USER_ENDPOINT, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/json',
                },
            });
            if (response.status !== 200 || response.headers.get('Content-Type') !== 'application/json') {
                console.error(`Error: ${response.status} - ${response.headers.get('Content-Type')}`);
                return;
            } else {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting user id', error);
            return;
        }
    }

    public async getUserEvents(username: string, after: string, page: number = 1): Promise<GitlabUserEventResponse | void> {
        try {
            const response = await fetch(`${GITLAB_USER_EVENTS_ENDPOINT.replace(':username', username)}?page=${page}&after=${after}`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/json',
                },
            });
            if (response.status !== 200 || response.headers.get('Content-Type') !== 'application/json') {
                console.error(`Error: ${response.status} - ${response.headers.get('Content-Type')}`);
                return;
            } else {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting user events', error);
            return;
        }
    }

    public async getMergeRequest(projectId: string, search: string): Promise<any | void> {
        try {
            const url = `${GITLAB_MERGE_REQUESTS_ENDPOINT.replace(':id', projectId).replace(':merge_request_iid', search)}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/json',
                },
            });
            if (response.status !== 200 || response.headers.get('Content-Type') !== 'application/json') {
                console.error(`Error: ${response.status} - ${response.headers.get('Content-Type')}`);
                return;
            } else {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting merge request', error);
            return;
        }
    }

    public async searchBranch(projectId: string, search: string): Promise<IGitlabBranchesResponse | void> {
        try {
            const url = `${GITLAB_BRANCHES_ENDPOINT.replace(':id', projectId)}${search}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/json',
                },
            });
            if (response.status !== 200 || response.headers.get('Content-Type') !== 'application/json') {
                console.error(`Error: ${response.status} - ${response.headers.get('Content-Type')}`);
                return;
            } else {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting branches', error);
            return;
        }
    }

    public async searchMergeRequest(projectId: string, search: string): Promise<any | void> {
        try {
            const url = `${GITLAB_SEARCH_MERGE_REQUESTS_ENDPOINT.replace(':id', projectId)}?search=${search}&in=title`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/json',
                },
            });
            if (response.status !== 200 || response.headers.get('Content-Type') !== 'application/json') {
                console.error(`Error: ${response.status} - ${response.headers.get('Content-Type')}`);
                return;
            } else {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting merge request', error);
            return;
        }
    }

    public async searchIssue(projectId: string, target_title: string) {
        try {
            const url = `https://gitlab.com/api/v4/projects/${projectId}/issues?search=${target_title}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/json',
                },
            });
            if (response.status !== 200 || response.headers.get('Content-Type') !== 'application/json') {
                console.error(`Error: ${response.status} - ${response.headers.get('Content-Type')}`);
                return;
            } else {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting merge request', error);
            return;
        }
    }
}
