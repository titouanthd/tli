import AbstractCommand from './abstract/AbstractCommand';
import { GITLAB_DAILY_RECAP } from '../globals/AppConstants';
import { Command } from 'commander';
import GitlabDailyRecapService from '../services/GitlabDailyRecapService';
import DateUtil from '../utils/DateUtil';

export default class GitlabDailyRecapCommand extends AbstractCommand {
    #gitlabDailyRecapService = new GitlabDailyRecapService();

    constructor(command: Command) {
        super(command, GITLAB_DAILY_RECAP, 'gdr', 'Gitlab daily recap');
    }

    public async execute(): Promise<void> {
        this.log(`Starting ${this.name} command`);
        const start = Date.now();
        const status = await this.#gitlabDailyRecapService.printDailyRecap();
        if (!status) {
            this.log('An error occurred while fetching the daily recap. Exiting...', 'error');
            return;
        }
        const duration = DateUtil.convertMillisecondsToDuration(Date.now() - start);
        this.log(`${this.name} executed in ${duration}`);
    }
}
