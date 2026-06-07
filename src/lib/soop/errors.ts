export class SoopApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly code?: number | string;

  constructor(params: {
    message: string;
    status: number;
    endpoint: string;
    code?: number | string;
  }) {
    super(params.message);
    this.name = "SoopApiError";
    this.status = params.status;
    this.endpoint = params.endpoint;
    this.code = params.code;
  }
}
