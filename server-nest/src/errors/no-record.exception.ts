export class NoRecordError extends Error {
  /**
   * Indicates an record with the given `id` and `recordType` could not be
   * located.
   * @param id of the record which could not be found.
   * @param recordType used to indicate the type of record.
   */
  constructor(private readonly id: string, private readonly recordType: string) {
    super();
  }

  get message(): string {
    return `${this.recordType}(id: "${this.id}") does not exist.`;
  }
}
