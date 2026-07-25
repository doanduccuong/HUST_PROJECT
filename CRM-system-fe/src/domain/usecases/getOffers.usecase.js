export class GetOffersUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(search = "") {
    return this.repository.list(search);
  }
}
