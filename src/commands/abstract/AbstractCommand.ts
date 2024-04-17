import { Command } from 'commander';
import DateUtil from '../../utils/DateUtil';
import LoggerService from '../../services/LoggerService';

export default abstract class AbstractCommand {
    private _identifier: string = DateUtil.getFormattedIsoDate() + '_' + this.name;
    private logger: LoggerService = LoggerService.getInstance();

    protected constructor(
        protected commander: Command,
        protected name: string,
        protected alias: string,
        protected description: string,
    ) {
        this.commander.command(this.name).alias(this.alias).description(this.description).action(this.execute.bind(this));
    }

    protected abstract execute(): Promise<void>;

    get identifier(): string {
        return this._identifier;
    }

    protected log(message: string, level: string = 'info'): void {
        this.logger.log(message, level);
    }
}
