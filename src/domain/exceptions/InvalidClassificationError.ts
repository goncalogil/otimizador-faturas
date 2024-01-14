export default class InvalidClassificationError extends Error {
  constructor(message: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidClassificationError.prototype);

    // Optionally, you can customize the error properties.
    this.name = 'InvalidClassificationError';
    this.date = new Date();
  }
  date: Date;
}
