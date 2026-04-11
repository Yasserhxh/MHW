export const validators = {
  required: (v: string) => (v.trim().length ? '' : 'This field is required.'),
  email: (v: string) => (/\S+@\S+\.\S+/.test(v) ? '' : 'Please enter a valid email address.'),
  password: (v: string) => (v.length >= 8 ? '' : 'Password must be at least 8 characters.'),
};
