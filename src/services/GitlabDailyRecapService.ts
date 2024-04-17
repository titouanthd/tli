import GitlabApiClient from '../clients/GitlabApiClient';
import { SEPARATOR } from '../globals/AppConstants';
import { Note } from '../clients/interfaces/GitlabUserEventResponse';

export default class GitlabDailyRecapService {
    public static async printDailyRecap(): Promise<boolean> {
        console.log('Gitlab daily recap');
        const client = new GitlabApiClient(process.env.GITLAB_PRIVATE_TOKEN);
        const user = await client.getUser();
        const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0];
        if (!user) {
            console.error('Error getting user');
            return false;
        }
        let page = 0;
        const userEvents = [];
        while (true) {
            console.log(`Getting page ${page}`);
            const pageEvents = await client.getUserEvents(user.username, todayMidnight, page++);
            if (!pageEvents || pageEvents.length <= 0) {
                console.log('No more events');
                break;
            }
            userEvents.push(...pageEvents);
        }

        userEvents.reverse();
        console.log('Events reversed');

        const countEvents = userEvents.length;

        if (countEvents <= 0) {
            console.log('No events found');
            return false;
        }

        const commits = userEvents.filter((event) => event.action_name === 'pushed to');
        const formattedCommits: {
            project_id: number;
            ref: string;
            ref_type: string;
            commit_count: number;
            commits: any[];
            ref_link: string | null;
        }[] = [];
        if (commits.length > 0) {
            for (const commit of commits) {
                if (!commit.push_data) {
                    continue;
                }
                const project_id = commit.project_id;
                const refType = commit.push_data.ref_type ?? 'No ref type';
                const ref = commit.push_data.ref ?? 'No ref';
                const commitCount = commit.push_data.commit_count ?? 'No commit count';
                const refIndex = formattedCommits.findIndex((work) => work.ref === ref);
                if (refIndex === -1) {
                    console.log('Trying to get branch', project_id.toString(), ref);
                    const branch = await client.searchBranch(project_id.toString(), encodeURIComponent(ref));
                    formattedCommits.push({
                        project_id: project_id,
                        ref: ref,
                        ref_type: refType,
                        commit_count: commitCount,
                        commits: [commit.push_data],
                        ref_link: branch ? branch.web_url : null,
                    });
                } else {
                    formattedCommits[refIndex].commit_count += commitCount;
                    if (commit.push_data) {
                        formattedCommits[refIndex].commits.push(commit.push_data);
                    }
                }
            }
        }

        console.log('Formatted commits');

        const mergeRequestsApprovals = userEvents.filter((event) => event.action_name === 'approved' && event.target_type === 'MergeRequest');
        const formattedMergeRequestsApprovals: {
            project_id: number;
            target_iid: number;
            target_title: string;
            action_name: string;
            created_at: string;
            link: string | null;
        }[] = [];
        for (const mra of mergeRequestsApprovals) {
            const refIndex = formattedMergeRequestsApprovals.findIndex((work) => work.target_iid === mra.target_iid);
            if (refIndex === -1) {
                console.log('Trying to get merge request', mra.project_id.toString(), mra.target_iid.toString());
                const mr = await client.getMergeRequest(mra.project_id.toString(), mra.target_iid.toString());
                formattedMergeRequestsApprovals.push({
                    project_id: mra.project_id,
                    target_iid: mra.target_iid,
                    target_title: mra.target_title,
                    action_name: mra.action_name,
                    created_at: mra.created_at,
                    link: mr ? mr.web_url : null,
                });
            }
        }

        console.log('Formatted merge requests approvals');

        const feedBacks = userEvents.filter((event) => event.action_name === 'commented on');
        const formattedFeedBacks: {
            project_id: number;
            target_iid: number;
            target_title: string;
            created_at: string;
            count: number;
            notes: Note[];
            link: string | null;
        }[] = [];
        for (const feedback of feedBacks) {
            const refIndex = formattedFeedBacks.findIndex((work) => work.target_title === feedback.target_title);
            if (refIndex === -1) {
                console.log('Trying to get merge request', feedback.project_id.toString(), feedback.target_title.toString());
                let mr = null;
                if (feedback.target_type === 'DiffNote') {
                    mr = await client.searchMergeRequest(feedback.project_id.toString(), encodeURIComponent(feedback.target_title.toString()));
                }
                formattedFeedBacks.push({
                    project_id: feedback.project_id,
                    target_iid: feedback.target_iid,
                    target_title: feedback.target_title,
                    created_at: feedback.created_at,
                    count: 1,
                    notes: feedback.note ? [feedback.note] : [],
                    link: mr !== null && mr[0] ? mr[0].web_url : null,
                });
            } else {
                formattedFeedBacks[refIndex].count++;
                if (feedback.note) {
                    formattedFeedBacks[refIndex].notes.push(feedback.note);
                }
            }
        }

        console.log('Formatted feedbacks');

        const newIssues = userEvents.filter((event) => event.action_name === 'opened' && event.target_type === 'Issue');
        const formattedNewIssues: {
            title: string;
            created_at: string;
            link: string | null;
        }[] = [];
        for (const newIssue of newIssues) {
            const refIndex = formattedNewIssues.findIndex((work) => work.title === newIssue.target_title);
            if (refIndex === -1) {
                console.log('Trying to get issue', newIssue.project_id.toString(), newIssue.target_title);
                const issue = await client.searchIssue(newIssue.project_id.toString(), newIssue.target_title);
                formattedNewIssues.push({
                    title: newIssue.target_title,
                    created_at: issue.created_at,
                    link: issue[0] ? issue[0].web_url : null,
                });
            }
        }

        console.log('Formatted new issues');

        let report = SEPARATOR + '\n';
        report += `Daily report for ${todayMidnight}\n`;

        report += 'Work on:\n';
        if (formattedCommits.length > 0) {
            for (const work of formattedCommits) {
                if (work.ref_link !== null) {
                    report += `[${work.ref}](${work.ref_link}) with ${work.commit_count} commits\n`;
                } else {
                    report += `${work.ref} with ${work.commit_count} commits\n`;
                }
            }
        } else {
            report += 'No work on\n';
        }

        report += 'Merge requests approvals:\n';
        if (formattedMergeRequestsApprovals.length > 0) {
            for (const mra of formattedMergeRequestsApprovals) {
                if (mra.link !== null) {
                    report += `${mra.action_name} [${mra.target_title}](${mra.link})\n`;
                } else {
                    report += `${mra.action_name} ${mra.target_title}\n`;
                }
            }
        } else {
            report += 'No reviews\n';
        }

        report += 'Feedbacks:\n';
        if (formattedFeedBacks.length > 0) {
            for (const feedback of formattedFeedBacks) {
                if (feedback.link !== null) {
                    report += `Feedback on [${feedback.target_title}](${feedback.link}) with ${feedback.count} notes\n`;
                } else {
                    report += `Feedback on ${feedback.target_title} with ${feedback.count} notes\n`;
                }
            }
        } else {
            report += 'No feedbacks\n';
        }

        report += 'New issues:\n';
        if (formattedNewIssues.length > 0) {
            for (const issue of formattedNewIssues) {
                if (issue.link !== null) {
                    report += `[${issue.title}](${issue.link})\n`;
                } else {
                    report += `${issue.title}\n`;
                }
            }
        } else {
            report += 'No new issues\n';
        }

        report += SEPARATOR;
        console.log(report);

        return true;
    }
}
