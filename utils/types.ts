import { Tables } from '@/types_db';

export enum AuthState {
  Signin = 'signin',
  ForgotPassword = 'forgot_password',
  Signup = 'signup',
  UpdatePassword = 'update_password'
}

export type StateInfo = {
  title: string;
  description?: string;
  submitText: string;
  onSubmit: () => void;
  hasEmailField: boolean;
  hasPasswordField: boolean;
  hasOAuth: boolean;
};

type Subscription = Tables<'subscriptions'>;
type Price = Tables<'prices'>;
type Product = Tables<'products'>;

export type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (Price & {
        products: Product | null;
      })
    | null;
};

export type Employee = {
  id: string;
  given_name: string;
  surname?: string;
  company_email: string;
  personal_email?: string;
  citizenship?: string;
  provisioned?: boolean;
  tax_residence?: string;
  location?: string;
}
