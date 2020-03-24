type Axis = 'rows' | 'columns';

export class OutOfBoundsException extends Error {
  /**
   * Indicates an `#openCoordinates` operation fell out of bounds of the grid.
   * @param axis indicating which group was out of bounds.
   * @param coordinate value which exceeded bounds.
   */
  constructor(
    private readonly axis: Axis,
    private readonly coordinate: number
  ) {
    super();
  }

  get message(): string {
    return `${this.coordinate} exceeded available ${this.axis}.`;
  }
}
