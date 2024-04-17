import GitlabApiClient from '../clients/GitlabApiClient';
import { SEPARATOR } from '../globals/AppConstants';
import { Note } from '../clients/interfaces/GitlabUserEventResponse';
import LoggerService from './LoggerService';

export default class GitlabDailyRecapService {
    #logger = LoggerService.getInstance();
    public async printDailyRecap(): Promise<boolean> {
        this.#logger.log('Gitlab daily recap');
        const client = new GitlabApiClient(process.env.GITLAB_PRIVATE_TOKEN);
        const user = await client.getUser();
        if (!user) {
            this.#logger.log('Error getting user', 'error');
            return false;
        }
        this.#logger.log(`Got user ${user.username}`);

        const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0];
        const yesterdayMidnight = new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        this.#logger.log(`Getting user events for : ${encodeURIComponent(todayMidnight)}...`);
        let page = 0;
        const userEvents = [];
        while (true) {
            const pageEvents = await client.getUserEvents(encodeURIComponent(user.username), encodeURIComponent(yesterdayMidnight), page++);
            if (!pageEvents || pageEvents.length <= 0) {
                this.#logger.log('No more events');
                break;
            } else {
                this.#logger.log(`Got ${pageEvents.length} events`);
            }
            userEvents.push(...pageEvents);
        }
        const countEvents = userEvents.length;
        if (countEvents <= 0) {
            this.#logger.log('No events found');
            return false;
        }

        this.#logger.log(`Got all user events ${userEvents.length} after ${todayMidnight}`);
        userEvents.reverse();
        this.#logger.log('Events reversed => oldest first');

        const commits = userEvents.filter((event) => event.action_name === 'pushed to');
        const formattedCommits: {
            project_id: number;
            ref: string;
            ref_type: string;
            commit_count: number;
            commits: any[];
            branch_link: string | null;
            issue_link: string | null;
            mr_link: string | null;
        }[] = [];
        if (commits.length > 0) {
            for (const commit of commits) {
                if (!commit.push_data) {
                    continue;
                }
                const project_id = commit.project_id;
                const refType = commit.push_data.ref_type;
                const ref = commit.push_data.ref;
                const commitCount = commit.push_data.commit_count;
                const refIndex = formattedCommits.findIndex((work) => work.ref === ref);
                if (refIndex === -1) {
                    const name = encodeURIComponent(ref);
                    this.#logger.log(`Trying to get branch ${project_id.toString()} ${name}`);
                    const branch = await client.getBranch(project_id.toString(), name);
                    if (branch) {
                        this.#logger.log(`Got branch ${branch.name}`);
                    }
                    formattedCommits.push({
                        project_id: project_id,
                        ref: ref,
                        ref_type: refType,
                        commit_count: commitCount,
                        commits: [commit.push_data],
                        issue_link: null,
                        mr_link: null,
                        branch_link: branch ? branch.web_url : null,
                    });
                } else {
                    formattedCommits[refIndex].commit_count += commitCount;
                    if (commit.push_data) {
                        formattedCommits[refIndex].commits.push(commit.push_data);
                    }
                }
            }
        }

        this.#logger.log('Formatted commits');

        const mergeRequestsApprovals = userEvents.filter((event) => event.action_name === 'approved' && event.target_type === 'MergeRequest');
        const formattedMergeRequestsApprovals: {
            project_id: number;
            target_iid: number;
            target_title: string;
            action_name: string;
            created_at: string;
            count: number;
            link: string | null;
        }[] = [];
        for (const mra of mergeRequestsApprovals) {
            const refIndex = formattedMergeRequestsApprovals.findIndex((work) => work.target_title === mra.target_title);
            if (refIndex === -1) {
                this.#logger.log(`Trying to get merge request ${mra.project_id.toString()} ${mra.target_iid.toString()}`);
                const mr = await client.getMergeRequest(encodeURIComponent(mra.project_id.toString()), encodeURIComponent(mra.target_iid.toString()));
                formattedMergeRequestsApprovals.push({
                    project_id: mra.project_id,
                    target_iid: mra.target_iid,
                    target_title: mra.target_title,
                    action_name: mra.action_name,
                    created_at: mra.created_at,
                    count: 1,
                    link: mr ? mr.web_url : null,
                });
            } else {
                formattedMergeRequestsApprovals[refIndex].count++;
            }
        }

        this.#logger.log('Formatted merge requests approvals');

        const feedBacks = userEvents.filter((event) => event.action_name === 'commented on');
        const formattedFeedBacks: {
            project_id: number;
            target_iid: number;
            target_title: string;
            noteable_type: string;
            created_at: string;
            count: number;
            notes: Note[];
            link: string | null;
        }[] = [];
        for (const feedback of feedBacks) {
            const refIndex = formattedFeedBacks.findIndex((work) => work.target_title === feedback.target_title);
            if (refIndex === -1) {
                const noteableType = feedback.note ? feedback.note.noteable_type : '';
                let link = null;
                if (noteableType === 'Issue') {
                    this.#logger.log(`Trying to get issue ${feedback.project_id.toString()} ${feedback.note?.noteable_iid.toString()}`);
                    const issues = await client.getIssue(
                        encodeURIComponent(feedback.project_id.toString()),
                        encodeURIComponent(feedback.note?.noteable_iid.toString() || '0'),
                    );
                    link = issues ? issues[0].web_url : null;
                } else if (noteableType === 'MergeRequest') {
                    this.#logger.log(`Trying to get merge request ${feedback.project_id.toString()} ${feedback.note?.noteable_iid.toString()}`);
                    const mergeRequest = await client.getMergeRequest(
                        encodeURIComponent(feedback.project_id.toString()),
                        encodeURIComponent(feedback.note?.noteable_iid.toString() || '0'),
                    );
                    link = mergeRequest ? mergeRequest.web_url : null;
                } else {
                    this.#logger.log(JSON.stringify(feedback));
                }

                formattedFeedBacks.push({
                    project_id: feedback.project_id,
                    target_iid: feedback.target_iid,
                    target_title: feedback.target_title,
                    noteable_type: noteableType,
                    created_at: feedback.created_at,
                    count: 1,
                    notes: feedback.note ? [feedback.note] : [],
                    link: link,
                });
            } else {
                formattedFeedBacks[refIndex].count++;
                if (feedback.note) {
                    formattedFeedBacks[refIndex].notes.push(feedback.note);
                }
            }
        }

        this.#logger.log('Formatted feedbacks');

        const newIssues = userEvents.filter((event) => event.action_name === 'opened' && event.target_type === 'Issue');
        const formattedNewIssues: {
            title: string;
            created_at: string;
            link: string | null;
        }[] = [];
        for (const newIssue of newIssues) {
            const refIndex = formattedNewIssues.findIndex((work) => work.title === newIssue.target_title);
            if (refIndex === -1) {
                this.#logger.log(`Trying to get issue ${newIssue.project_id.toString()} ${newIssue.target_title}`);
                const issue = await client.searchIssue(newIssue.project_id.toString(), newIssue.target_title);
                formattedNewIssues.push({
                    title: newIssue.target_title,
                    created_at: issue.created_at,
                    link: issue[0] ? issue[0].web_url : null,
                });
            }
        }

        this.#logger.log('Formatted new issues');

        this.printRecap(todayMidnight, formattedCommits, formattedMergeRequestsApprovals, formattedFeedBacks, formattedNewIssues);

        return true;
    }

    private printRecap(
        todayMidnight: string,
        formattedCommits: {
            project_id: number;
            ref: string;
            ref_type: string;
            commit_count: number;
            commits: any[];
            issue_link: string | null;
            mr_link: string | null;
            branch_link: string | null;
        }[],
        formattedMergeRequestsApprovals: {
            project_id: number;
            target_iid: number;
            target_title: string;
            action_name: string;
            created_at: string;
            count: number;
            link: string | null;
        }[],
        formattedFeedBacks: {
            project_id: number;
            target_iid: number;
            target_title: string;
            noteable_type: string;
            created_at: string;
            count: number;
            notes: Note[];
            link: string | null;
        }[],
        formattedNewIssues: { title: string; created_at: string; link: string | null }[],
    ) {
        this.#logger.log('Printing daily recap');
        let report = SEPARATOR + '\n';
        report += `*Daily report for ${todayMidnight}*\n`;

        if (formattedCommits.length > 0) {
            report += '*Work on:*\n';
            for (const work of formattedCommits) {
                if (work.branch_link !== null) {
                    report += ` - ${work.ref_type} [${work.ref}](${work.branch_link}) with ${work.commit_count} commits\n`;
                } else {
                    report += ` - ${work.ref_type} ${work.ref} with ${work.commit_count} commits\n`;
                }
            }
        }

        if (formattedMergeRequestsApprovals.length > 0) {
            report += '*MR approved:*\n';
            for (const mra of formattedMergeRequestsApprovals) {
                if (mra.link !== null) {
                    report += ` - ${mra.action_name} mr [${mra.target_title}](${mra.link})\n`;
                } else {
                    report += ` - ${mra.action_name} mr ${mra.target_title}\n`;
                }
            }
        }

        if (formattedFeedBacks.length > 0) {
            report += '*Feedbacks:*\n';
            for (const feedback of formattedFeedBacks) {
                if (feedback.link !== null) {
                    report += ` - feedback on ${feedback.noteable_type} [${feedback.target_title}](${feedback.link}) with ${feedback.count} notes\n`;
                } else {
                    report += ` - Feedback on ${feedback.noteable_type} ${feedback.target_title} with ${feedback.count} notes\n`;
                }
            }
        }

        if (formattedNewIssues.length > 0) {
            report += '*New issues:*\n';
            for (const issue of formattedNewIssues) {
                if (issue.link !== null) {
                    report += ` - [${issue.title}](${issue.link})\n`;
                } else {
                    report += ` - ${issue.title}\n`;
                }
            }
        }

        report += SEPARATOR;
        console.log(report);
    }
}
