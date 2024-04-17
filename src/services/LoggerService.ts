export default class LoggerService {
    private static instance: LoggerService;

    public log(message: string, level: string = 'info'): void {
        const formattedMessage = `::${new Date().toISOString()}:: [${level.toUpperCase()}] ${message}`;
        if (level === 'error') {
            console.error(formattedMessage);
        } else if (level === 'warn') {
            console.warn(formattedMessage);
        } else {
            console.log(formattedMessage);
        }
    }

    public static getInstance() {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }

        return LoggerService.instance;
    }
}
