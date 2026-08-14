export interface DependencyBuilder<TAccumulated> {
  extend<TAdditional>(
    fn: (accumulated: TAccumulated) => TAdditional
  ): DependencyBuilder<Omit<TAccumulated, keyof TAdditional> & TAdditional>;
  build(): TAccumulated;
}

export type AnyDependencyExtension = (accumulated: unknown) => unknown;

class DependencyBuilderImplementation<TAccumulated>
  implements DependencyBuilder<TAccumulated>
{
  private _dependencyExtensions: AnyDependencyExtension[];

  public constructor(extensions: AnyDependencyExtension[] = []) {
    this._dependencyExtensions = extensions;
  }

  public extend<TAdditional>(
    fn: (accumulated: TAccumulated) => TAdditional
  ): DependencyBuilder<Omit<TAccumulated, keyof TAdditional> & TAdditional> {
    return new DependencyBuilderImplementation<
      Omit<TAccumulated, keyof TAdditional> & TAdditional
    >([...this._dependencyExtensions, fn] as AnyDependencyExtension[]);
  }

  public build(): TAccumulated {
    const accumulated = {} as Record<string, unknown>;

    for (const extension of this._dependencyExtensions) {
      const additional = extension(accumulated);
      if (additional && typeof additional === "object") {
        Object.assign(accumulated, additional);
      }
    }

    return accumulated as TAccumulated;
  }
}

export function dependencies(): DependencyBuilder<Record<never, never>> {
  return new DependencyBuilderImplementation<Record<never, never>>();
}