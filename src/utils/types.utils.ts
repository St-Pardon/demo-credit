export interface Req {
    first_name: string;
    last_name: string;
    email: string;
    created_at?: Date;
    updated_at?: Date;
    password: string;
}

export interface AccountInfo {
    account_id: string;
    user_id: string;
    account_type?: string | any;
    account_no: number;
  }