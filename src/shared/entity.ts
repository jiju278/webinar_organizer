export abstract class Entity<T> {
  public initialState: T;
  public props: T;

  constructor(data: T) {
    this.initialState = { ...data };
    this.props = { ...data };
    Object.freeze(this.initialState);
  }

  update(data: Partial<T>): void {
    this.props = { ...this.props, ...data };
  }

  commit(): void {
    this.initialState = this.props;
  }

  clone() {
    return new (this.constructor as any)(this.props);
  }
}
