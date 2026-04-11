/**
 * JSON-serializable values (structurally compatible with Prisma `InputJsonValue`).
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly (JsonValue | null)[]
  | JsonObject;

export type JsonObject = { readonly [key: string]: JsonValue | undefined };
