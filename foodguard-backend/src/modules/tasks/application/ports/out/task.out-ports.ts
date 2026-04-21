export const ITaskRepository = Symbol('ITaskRepository');

export interface ITaskRepository {
  updateExpiredProducts(): Promise<number>;
}
