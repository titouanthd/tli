import IGitlabUserResponse from './interfaces/IGitlabUserResponse';
import {
    GITLAB_BRANCHES_ENDPOINT,
    GITLAB_ISSUES_ENDPOINT,
    GITLAB_MERGE_REQUESTS_ENDPOINT,
    GITLAB_USER_ENDPOINT,
    GITLAB_USER_EVENTS_ENDPOINT,
} from '../globals/AppConstants';
import GitlabUserEventResponse from './interfaces/GitlabUserEventResponse';
import IGitlabBranchesResponse from './interfaces/IGitlabBranchesResponse';

export default class GitlabApiClient {
    readonly #token: string | undefined;
    constructor(token?: string) {
        this.#token = token;
        if (!this.#token) {
            console.error('Error: GitlabApiClient requires a token');
        }
    }

    public get token(): string | undefined {
        return this.#token;
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
            const response = await fetch(`${GITLAB_USER_EVENTS_ENDPOINT.replace(':username', username)}?per_page=100&page=${page}&after=${after}`, {
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
            const url = `${GITLAB_MERGE_REQUESTS_ENDPOINT.replace(':id', projectId)}/${search}`;
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

    public async getBranch(projectId: string, search: string): Promise<IGitlabBranchesResponse | void> {
        try {
            const url = `${GITLAB_BRANCHES_ENDPOINT.replace(':id', projectId)}/${search}`;
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
            const url = `${GITLAB_MERGE_REQUESTS_ENDPOINT.replace(':id', projectId)}?search=${search}&in=title`;
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
            const url = `${GITLAB_ISSUES_ENDPOINT.replace(':id', projectId)}?search=${target_title}&in=title`;
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

    async getIssue(projectId: string, targetIid: string): Promise<any[] | void> {
        try {
            const url = `${GITLAB_ISSUES_ENDPOINT.replace(':id', projectId)}?iids[]=${targetIid}`;
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
