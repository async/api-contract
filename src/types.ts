export type ContractRef<
  Id extends string = string,
  Features extends string = string
> = {
  readonly __apiContract?: {
    readonly id: Id;
    readonly features: Features;
  };
};

export type RequiresContract<
  Id extends string = string,
  Features extends string = string
> = ContractRef<Id, Features> & {
  readonly __requiresContract?: true;
};

export type SupportsContract<
  Id extends string = string,
  Features extends string = string
> = ContractRef<Id, Features> & {
  readonly __supportsContract?: true;
};

export type ContractIdOf<T> =
  T extends ContractRef<infer Id, string> ? Id : never;

export type FeaturesOf<T> =
  T extends ContractRef<string, infer Features> ? Features : never;

export type MissingFeatures<Required, Supported> =
  Exclude<FeaturesOf<Required>, FeaturesOf<Supported>>;

export type IsLooseFeatureSet<T> =
  string extends FeaturesOf<T> ? true : false;

export type IsCompatible<Required, Supported> =
  IsLooseFeatureSet<Required> extends true ? boolean :
  IsLooseFeatureSet<Supported> extends true ? boolean :
  ContractIdOf<Required> extends ContractIdOf<Supported>
    ? MissingFeatures<Required, Supported> extends never
      ? true
      : false
    : false;

export type AssertCompatible<Required, Supported> =
  IsCompatible<Required, Supported> extends true
    ? true
    : IsCompatible<Required, Supported> extends boolean
      ? true
      : ["Missing API contract features", MissingFeatures<Required, Supported>];

export type Expect<T extends true> = T;
