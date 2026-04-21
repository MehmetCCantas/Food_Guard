export const ITaskService = Symbol('ITaskService');

export interface ITaskService {
  processExpiredProducts(): Promise<number>;
}
