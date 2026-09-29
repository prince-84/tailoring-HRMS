export interface PayrollSlipHeader {
  referenceNo: string;
  createDate: string;
  employerId?: string | null;
  employerName?: string | null;
  salaryMonth: number;
  salaryYear: number;
  employeeCount: number;
  totalSalary: number;
  atmCount: number;
  atmAmount: number;
  status: string;
  bankCount: number;
  bankAmount: number;
}

export interface PayrollSlipEmployeeRow {
  employeeName: string;
  employeeMolId: string;
  payMode: string;
  bankName: string;
  accountNo?: string | null;
  numberOfLeaves: number;
  fixAmount: number;
  varAmount: number;
  totalAmount: number;
}

export interface PayrollSlipTotals {
  fixAmount: number;
  varAmount: number;
  totalAmount: number;
}

export interface PayrollSlipData {
  header: PayrollSlipHeader;
  employees: PayrollSlipEmployeeRow[];
  totals: PayrollSlipTotals;
}