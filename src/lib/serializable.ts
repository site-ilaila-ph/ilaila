type AnySerializablePrimitive = string | number | boolean | null;
type AnySerializable =
  | AnySerializablePrimitive
  | AnySerializable[]
  | { [key: string]: AnySerializable };

export type {
    AnySerializablePrimitive,
    AnySerializable
}