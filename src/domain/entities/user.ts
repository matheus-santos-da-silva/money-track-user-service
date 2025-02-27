interface UserProps {
  email: string;
  name: string;
  password: string;
  plan: string;
}

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: string;
  created_at: Date;

  constructor({ email, name, plan, password }: UserProps) {
    this.email = email;
    this.name = name;
    this.plan = plan;
    this.password = password;
  }
}
