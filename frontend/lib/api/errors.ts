import type { ApiError } from "@/types/api";

export class ApiClientError extends Error {
  statusCode: number;
  apiError: ApiError;

  constructor(apiError: ApiError) {
    const message = Array.isArray(apiError.message)
      ? apiError.message.join(". ")
      : apiError.message;
    super(message || apiError.error || "No se pudo completar la solicitud.");
    this.name = "ApiClientError";
    this.statusCode = apiError.statusCode;
    this.apiError = apiError;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function getErrorMessage(error: unknown) {
  if (isApiClientError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado.";
}
