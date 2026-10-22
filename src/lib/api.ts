import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import type { PrismaClientKnownRequestError } from "@prisma/orm-postgres/runtime";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function success<T>(data: T, pagination?: ApiResponse["pagination"]): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, pagination }, { status: 200 });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

export function unauthorized(message = "Unauthorized"): NextResponse<ApiResponse> {
  return error("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden"): NextResponse<ApiResponse> {
  return error("FORBIDDEN", message, 403);
}

export function notFound(message = "Not found"): NextResponse<ApiResponse> {
  return error("NOT_FOUND", message, 404);
}

export function conflict(message = "Conflict"): NextResponse<ApiResponse> {
  return error("CONFLICT", message, 409);
}

export function internal(message = "Internal server error"): NextResponse<ApiResponse> {
  return error("INTERNAL", message, 500);
}

export function validationError(err: ZodError): NextResponse<ApiResponse> {
  return error("VALIDATION_ERROR", "Invalid input", 400, err.flatten().fieldErrors);
}

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<{ data: T } | NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return validationError(result.error);
    }
    return { data: result.data };
  } catch {
    return error("INVALID_JSON", "Invalid JSON body", 400);
  }
}

export function parseQuery<T extends Record<string, string | string[] | undefined>>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { data: T } | NextResponse<ApiResponse> {
  const obj: Record<string, string | string[]> = {};
  for (const [key, value] of searchParams.entries()) {
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key] as string, value];
      }
    } else {
      obj[key] = value;
    }
  }
  const result = schema.safeParse(obj);
  if (!result.success) {
    return validationError(result.error);
  }
  return { data: result.data };
}

export function parsePagination(params: { page?: string; pageSize?: string }) {
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(params.pageSize || "20", 10)));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function validateUuid(value: string, field = "id"): NextResponse<ApiResponse> | null {
  if (!isValidUuid(value)) {
    return error("INVALID_ID", `Invalid ${field}`, 400);
  }
  return null;
}

export function handlePrismaError(err: unknown): NextResponse<ApiResponse> {
  if (err instanceof ZodError) {
    return validationError(err);
  }

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return conflict("A record with this value already exists");
      case "P2003":
        return error("FOREIGN_KEY_CONSTRAINT", "Referenced record does not exist", 400);
      case "P2025":
        return notFound("Record not found");
      default:
        console.error("Prisma error:", err);
        return internal("Database operation failed");
    }
  }

  if (err instanceof Error) {
    if (err.message.includes("available") || err.message.includes("accommodates")) {
      return error("BAD_REQUEST", err.message, 400);
    }
  }

  console.error("Unexpected error:", err);
  return internal();
}

export function handleError(err: unknown): NextResponse<ApiResponse> {
  if (err instanceof ZodError) {
    return validationError(err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err);
  }

  if (err instanceof Error) {
    if (err.message.includes("available") || err.message.includes("accommodates")) {
      return error("BAD_REQUEST", err.message, 400);
    }
  }

  console.error("Error:", err);
  return internal();
}