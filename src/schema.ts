import type { FeatureSpec } from "./model.js";
import {
  defineJsonSchema,
  defineSchema as defineInterfaceSchema
} from "./interface.js";
import type {
  DefineSchemaInput,
  JsonSchemaAdapterOptions,
  SchemaAdapter,
  SchemaDescription,
  SchemaFieldHint,
  SchemaMetadata
} from "./interface.js";

export interface StandardSchemaLike<T = unknown> {
  readonly "~standard": {
    readonly vendor?: string;
    readonly version?: number;
    validate(value: unknown): StandardSchemaValidationResult<T> | Promise<StandardSchemaValidationResult<T>>;
  };
}

export type StandardSchemaValidationResult<T> =
  | { value: T; issues?: undefined }
  | { issues: readonly StandardSchemaIssue[]; value?: undefined };

export interface StandardSchemaIssue {
  message: string;
  path?: readonly (string | number | symbol)[];
}

export interface StandardSchemaAdapterOptions<T> {
  jsonSchema?: unknown;
  defaults?(): Partial<T>;
  examples?(): readonly T[];
  describe?(): SchemaDescription;
}

export {
  type DefineSchemaInput,
  type JsonSchemaAdapterOptions,
  type SchemaAdapter,
  type SchemaDescription,
  type SchemaFieldHint,
  type SchemaMetadata
};

export function defineSchema<T = unknown>(input: DefineSchemaInput<T>): SchemaMetadata<T> {
  return defineInterfaceSchema(input);
}

export function jsonSchemaAdapter<T = unknown>(schema: unknown, options: JsonSchemaAdapterOptions<T> = {}): SchemaAdapter<T> {
  return defineJsonSchema(schema, options);
}

export function standardSchemaAdapter<T = unknown>(
  schema: StandardSchemaLike<T>,
  options: StandardSchemaAdapterOptions<T> = {}
): SchemaAdapter<T> {
  return {
    parse(value: unknown): T {
      const result = schema["~standard"].validate(value);
      if (isPromiseLike(result)) {
        throw new Error("standardSchemaAdapter.parse only supports synchronous validation");
      }
      if ("issues" in result && result.issues) {
        throw new Error(result.issues.map((issue) => issue.message).join("; "));
      }
      return result.value;
    },
    jsonSchema: () => options.jsonSchema ?? {},
    ...(options.defaults ? { defaults: options.defaults } : {}),
    ...(options.examples ? { examples: options.examples } : {}),
    ...(options.describe ? { describe: options.describe } : {})
  };
}

export function createSchemaFeature(schema: SchemaMetadata, options: {
  releaseTag?: FeatureSpec["releaseTag"];
  stability?: FeatureSpec["stability"];
  lifecycle?: FeatureSpec["lifecycle"];
  group?: string;
} = {}): FeatureSpec {
  return {
    id: schema.featureId ?? `schema.${schema.id}`,
    title: schema.title ?? schema.id,
    releaseTag: options.releaseTag ?? "public",
    lifecycle: options.lifecycle ?? "active",
    ...(schema.description === undefined ? {} : { description: schema.description }),
    ...(options.stability === undefined ? {} : { stability: options.stability }),
    group: options.group ?? "schemas"
  };
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return typeof value === "object" && value !== null && "then" in value;
}
