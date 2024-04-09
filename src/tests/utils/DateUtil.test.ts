import DateUtil from '../../utils/DateUtil';

describe('DateUtil', () => {
    it('should get formatted iso date', () => {
        const formattedIsoDate = DateUtil.getFormattedIsoDate();
        const date = new Date();
        const expected = date.toISOString().replace(/:/g, '-');
        expect(formattedIsoDate).toBe(expected);
    });

    it('should convert milliseconds to duration', () => {
        const totalDuration = 1000;
        const duration = DateUtil.convertMillisecondsToDuration(totalDuration);
        expect(duration).toBe('0d 0h 0m 1s');
    });
});
