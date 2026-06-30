export class Customer {
  constructor({ id, name, identified, distance = 0, isNew = false }) {
    this.id = id;
    this.name = name;
    this.identified = identified;
    this.distance = distance;
    this.isNew = isNew;
  }
}
