/** Placeholder interpolation for message templates. Pure and safe in both server and client code. */

export type MessageVariables = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Replaces `{name}` placeholders with their values. Unknown placeholders stay visible instead of
 * becoming "undefined", which makes a missing variable obvious in review.
 */
export function interpolate(template: string, variables: MessageVariables = {}): string {
  return template.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = variables[name];
    return value === undefined ? placeholder : String(value);
  });
}

/** Picks the singular/plural template for `count`, then injects `{count}` plus extra variables. */
export function countMessage(
  count: number,
  forms: { one: string; many: string },
  variables: MessageVariables = {},
): string {
  return interpolate(count === 1 ? forms.one : forms.many, { count, ...variables });
}
