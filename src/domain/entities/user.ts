interface UserProps {
  email: string;
  password: string;
  plan: string;
}

export class User {
  id: string;
  name?: string;
  email: string;
  password: string;
  plan: string;
  created_at: Date;

  constructor({ email, plan, password }: UserProps) {
    this.email = email;
    this.plan = plan;
    this.password = password;
  }
}
