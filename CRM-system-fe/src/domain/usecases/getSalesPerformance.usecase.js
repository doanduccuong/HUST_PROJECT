export class GetSalesPerformanceUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getPerformance();
  }
}
