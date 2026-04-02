export const MESSAGES = {
  COMMON: {
    SUCCESS: "Success",
    INTERNAL_ERROR: "Something went wrong",
    BAD_REQUEST: "Invalid request",
  },

  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    INVALID_CREDENTIALS: "Invalid email or password",
    UNAUTHORIZED: "Unauthorized access",
  },

  USER: {
    CREATED: "User created successfully",
    NOT_FOUND: "User not found",
  },
} as const