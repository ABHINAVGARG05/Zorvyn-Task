import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { registerSchema, loginSchema, refreshSchema } from "./schemas/auth";
import {
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
} from "./schemas/records";
import {
  userListSchema,
  updateRoleSchema,
  updateStatusSchema,
} from "./schemas/users";
import { dashboardFilterSchema } from "./schemas/dashboard";
import { idParamSchema } from "./schemas/common";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const UserSchema = registry.register(
  "User",
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["admin", "analyst", "viewer"]),
    status: z.enum(["active", "inactive"]),
    created_at: z.string(),
  }),
);

const RecordSchema = registry.register(
  "Record",
  z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    amount: z.number(),
    type: z.enum(["income", "expense"]),
    category: z.string(),
    date: z.string(),
    notes: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
);

const ErrorResponse = registry.register(
  "ErrorResponse",
  z.object({
    success: z.boolean(),
    message: z.string(),
    error: z
      .object({
        code: z.string(),
        statusCode: z.number(),
      })
      .optional(),
  }),
);

registry.registerPath({
  method: "post",
  path: "/auth/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: UserSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    409: {
      description: "Email already in use",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login success",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              token: z.string(),
              refreshToken: z.string(),
              user: UserSchema,
            }),
          }),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Account inactive",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Token refreshed",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              token: z.string(),
              refreshToken: z.string(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Refresh token invalid or expired",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshSchema,
        },
      },
    },
  },
  responses: {
    200: { description: "Logged out" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Refresh token invalid",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users",
  request: { query: userListSchema },
  responses: {
    200: {
      description: "User list",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(UserSchema),
            meta: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/{id}/role",
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: updateRoleSchema } } },
  },
  responses: {
    200: { description: "Role updated" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/{id}/status",
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: updateStatusSchema } } },
  },
  responses: {
    200: { description: "Status updated" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/records",
  request: {
    body: { content: { "application/json": { schema: createRecordSchema } } },
  },
  responses: {
    201: {
      description: "Record created",
      content: { "application/json": { schema: RecordSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/records",
  request: { query: recordFilterSchema },
  responses: {
    200: { description: "Records" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/records/{id}",
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: updateRecordSchema } } },
  },
  responses: {
    200: { description: "Record updated" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "Record not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/records/{id}",
  request: { params: idParamSchema },
  responses: {
    200: { description: "Record deleted" },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "Record not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/dashboard/summary",
  request: { query: dashboardFilterSchema },
  responses: {
    200: { description: "Summary" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/dashboard/by-category",
  request: { query: dashboardFilterSchema },
  responses: {
    200: { description: "By category" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/dashboard/trends",
  request: { query: dashboardFilterSchema },
  responses: {
    200: { description: "Trends" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/dashboard/recent",
  request: { query: dashboardFilterSchema },
  responses: {
    200: { description: "Recent" },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/health",
  responses: {
    200: { description: "Health" },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/db-health",
  responses: {
    200: { description: "DB health" },
    503: {
      description: "Database unavailable",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

export const getOpenApiDocument = (): ReturnType<
  OpenApiGeneratorV3["generateDocument"]
> => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Finance Data Processing and Access Control Backend",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000" }],
  });
};
