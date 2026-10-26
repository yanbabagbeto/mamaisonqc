/** Serializable states for the account forms driven by `useActionState`. */

export type AuthErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
};

export type SignInState = {
  values: { email: string };
  errors: AuthErrors;
};

export type SignUpState = {
  values: { name: string; email: string; claim: string };
  errors: AuthErrors;
};

export function initialSignInState(email = ""): SignInState {
  return { values: { email }, errors: {} };
}

export function initialSignUpState(input: { name?: string; email?: string; claim?: string } = {}): SignUpState {
  return {
    values: { name: input.name ?? "", email: input.email ?? "", claim: input.claim ?? "" },
    errors: {},
  };
}
