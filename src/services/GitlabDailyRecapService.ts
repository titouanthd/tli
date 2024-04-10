import { GITLAB_USER_EVENTS_ENDPOINT, SEPARATOR } from '../globals/AppConstants';
import GitlabUserEventResponse, { Note, PushData } from '../interfaces/responses/GitlabUserEventResponse';

export default class GitlabDailyRecapService {
    public static async printDailyRecap(): Promise<boolean> {
        console.log('Gitlab daily recap');
        const username = process.env.GITLAB_USERNAME;
        const accessToken = process.env.GITLAB_PRIVATE_TOKEN;

        if (!username || !accessToken) {
            console.error('GITLAB_USERNAME or/and GITLAB_PRIVATE_TOKEN is/are not defined');
            return false;
        }

        // wtf js
        const after = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
        const endpoint = GITLAB_USER_EVENTS_ENDPOINT.replace('%s', username) + `?per_page=100&after=${after}`;

        const response = await fetch(endpoint, {
            headers: {
                'PRIVATE-TOKEN': accessToken,
            },
        });

        if (response.status !== 200 || response.headers.get('Content-Type') !== 'application/json') {
            console.error(`Error: ${response.status} - ${response.headers.get('Content-Type')}`);
            return false;
        }

        const data: [GitlabUserEventResponse] = await response.json();

        if (!Array.isArray(data)) {
            console.error('Error: response is not a list');
            return false;
        }

        // reversed the array to have the latest events first
        data.reverse();

        const countEvents = data.length;
        if (countEvents <= 0) {
            console.log('No events found');
            return true;
        }

        const commits = data.filter((event) => event.action_name === 'pushed to' && event.target_title === null);
        const workOn: {
            ref: string;
            ref_type: string;
            commit_count: number;
            commits: PushData[];
        }[] = [];
        for (const commit of commits) {
            if (!commit.push_data) {
                continue;
            }

            const refType = commit.push_data.ref_type ?? 'No ref type';
            const ref = commit.push_data.ref ?? 'No ref';
            const commitCount = commit.push_data.commit_count ?? 'No commit count';

            // we want to push only the unique ref
            const refIndex = workOn.findIndex((work) => work.ref === ref);
            if (refIndex === -1) {
                workOn.push({ ref: ref, ref_type: refType, commit_count: commitCount, commits: [commit.push_data] });
            } else {
                workOn[refIndex].commit_count += commitCount;
                workOn[refIndex].commits.push(commit.push_data);
            }
        }

        const mergeRequestsApprovals = data.filter((event) => event.action_name === 'approved' && event.target_title !== null);
        // console.log('mergeRequestsApprovals', mergeRequestsApprovals);
        const comments = data.filter((event) => event.target_type === 'DiffNote' && event.action_name === 'commented on');
        // console.log('comments', comments);
        const reviews = mergeRequestsApprovals.concat(comments);
        reviews.sort((a, b) => {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        console.log('reviews', reviews);
        const reviewed: {
            target_title: string;
            action_name: string;
            created_at: string;
            count: number;
            notes: Note[];
        }[] = [];
        for (const review of reviews) {
            const action = review.action_name;
            const targetTitle = review.target_title;
            const createdAt = new Date(review.created_at).toLocaleTimeString();
            // we want to push only the unique target title
            // if it a comment on
            const targetIndex = reviewed.findIndex((reviewed) => reviewed.target_title === targetTitle);
            if (targetIndex === -1) {
                if (review.note !== undefined) {
                    reviewed.push({
                        target_title: targetTitle,
                        action_name: action,
                        created_at: createdAt,
                        count: 1,
                        notes: [review.note],
                    });
                } else {
                    reviewed.push({
                        target_title: targetTitle,
                        action_name: action,
                        created_at: createdAt,
                        count: 1,
                        notes: [],
                    });
                }
            } else {
                if (review.note !== undefined) {
                    reviewed[targetIndex].notes.push(review.note);
                    reviewed[targetIndex].count += 1;
                }
            }
        }

        let report = SEPARATOR + '\n';
        report += `Daily report for ${after}\n`;

        report += 'Work on:\n';
        if (workOn.length > 0) {
            for (const work of workOn) {
                report += `- ${work.ref} with ${work.commit_count} commits\n`;
            }
        } else {
            report += 'No work on\n';
        }

        report += 'Reviews:\n';
        if (reviewed.length > 0) {
            for (const review of reviewed) {
                report += `- ${review.action_name} ${review.target_title} with ${review.count} comments\n`;
            }
        } else {
            report += 'No reviews\n';
        }

        report += SEPARATOR;
        console.log(report);
        return true;
    }
}
