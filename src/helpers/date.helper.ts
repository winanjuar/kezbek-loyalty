export class DateHelper {
  static getDateDiff(end: Date, start: Date): number {
    const msInDay = 24 * 60 * 60 * 1000;
    const endDate = new Date(end);
    const daysDiff =
      Math.floor((Number(endDate) - Number(start)) / msInDay) || 0;
    return daysDiff;
  }
}
