type OmitUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

export function pickDefined<T extends Record<string, unknown>>(obj: T): OmitUndefined<T> {
  const result = {} as OmitUndefined<T>;

  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (value !== undefined) {
      (result as Record<string, unknown>)[key as string] = value;
    }
  }

  return result;
}
