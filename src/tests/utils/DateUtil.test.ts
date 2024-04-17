import DateUtil from '../../utils/DateUtil';

describe('DateUtil', () => {
    it('should get formatted iso date', () => {
        const formattedIsoDate = DateUtil.getFormattedIsoDate();
        const regexp = new RegExp(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z/);
        expect(formattedIsoDate).toMatch(regexp);
    });

    it('should convert milliseconds to duration', () => {
        const totalDuration = 1000;
        const duration = DateUtil.convertMillisecondsToDuration(totalDuration);
        expect(duration).toBe('0d 0h 0m 1s');
    });
});
