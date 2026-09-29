import React from "react";
import styles from "./PayrollSlip.module.css";
import type {
  PayrollSlipData,
  PayrollSlipEmployeeRow,
} from "./payroll-slip.types";

/* ------------------------------------------------------------------ */
/* Formatting helpers - mirror the XLSX number formats exactly          */
/* ------------------------------------------------------------------ */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "YYYY-MM-DD" -> "DD/MM/YYYY" (string based, no timezone shifts) */
function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** #,##0 */
function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** #,##0.00 */
function fmt2(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * XLSX accounting format:  _(* #,##0_);_(* \(#,##0\);_(* "-"??_);_(@_)
 * zero -> "-", negatives in parentheses, positives keep the space of ")".
 */
function Accounting({ value }: { value: number }) {
  const r = Math.round(value);
  if (r === 0) {
    return (
      <>
        -{"\u2007\u2007"}
        <span className={styles.hiddenParen}>)</span>
      </>
    );
  }
  if (r < 0) return <>({Math.abs(r).toLocaleString("en-US")})</>;
  return (
    <>
      {r.toLocaleString("en-US")}
      <span className={styles.hiddenParen}>)</span>
    </>
  );
}

/**
 * The XLSX header cells are single text cells with the label and value
 * separated by a fixed run of spaces, e.g. "Reference No:            251415056620".
 * `gap` is the number of spaces used in the source cell.
 */
const pad = (label: string, gap: number, value: string | number) =>
  `${label}${" ".repeat(gap)}${value}`;

/* Column widths (XLSX px) -> percentages so print can scale the sheet */
const COL_PX = [363, 143, 126, 124, 213, 107, 94, 186, 138];
const COL_TOTAL = COL_PX.reduce((a, b) => a + b, 0);

/* ------------------------------------------------------------------ */

const PRINT_CSS = `
@page { size: A4 landscape; margin: 0.75in 0.7in; }
@media print {
  body * { visibility: hidden !important; }
  [data-payroll-slip], [data-payroll-slip] * { visibility: visible !important; }
  [data-payroll-slip] { position: absolute; left: 0; top: 0; width: 100%; }
}
`;

interface PayrollSlipProps {
  payroll: PayrollSlipData;
}

export default function PayrollSlip({ payroll }: PayrollSlipProps) {
  const { header: h, employees, totals } = payroll;

  return (
    <>
      {/* Global print rules: CSS modules can't express @page or `body *`.
          Injected only while a slip is mounted, so other pages are unaffected. */}
      <style
        dangerouslySetInnerHTML={{ __html: PRINT_CSS }}
      />
      <div className={styles.screenWrap} data-payroll-slip>
        <div className={styles.root}>
          <h1 className={styles.payrollTitle}>
            AL SAHAM FIDHI TAILORING WORKSHOP
          </h1>
          {/* ---------- Rows 1-7: "Sif Details" block (no borders) ---------- */}
          <table className={`${styles.grid} ${styles.info}`}>
            <colgroup>
              {COL_PX.map((w, i) => (
                <col key={i} style={{ width: `${(w / COL_TOTAL) * 100}%` }} />
              ))}
            </colgroup>
            <tbody>
              {/* Row 1 */}
              <tr>
                <td>Sif Details:</td>
                <td /><td /><td /><td /><td /><td /><td /><td />
              </tr>
              {/* Rows 2-3: blank spacer rows */}
              <tr className={styles.spacer}><td colSpan={9} /></tr>
              <tr className={styles.spacer}><td colSpan={9} /></tr>
              {/* Row 4 */}
              <tr>
                <td>{pad("Reference No:", 12, h.referenceNo)}</td>
                <td /><td /><td />
                <td>
                  {pad(
                    "Salary Month:",
                    10,
                    `${MONTHS[h.salaryMonth - 1]}-${h.salaryYear}`
                  )}
                </td>
                <td />
                <td colSpan={2}>{pad("ATM Count:", 6, h.atmCount)}</td>
                <td>{pad("Bank Count:", 7, h.bankCount)}</td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td>{pad("Create Date:", 15, formatDate(h.createDate))}</td>
                <td /><td /><td />
                <td>{pad("Emploee Count:", 8, h.employeeCount)}</td>
                <td />
                <td colSpan={2}>{pad("ATM Amount:", 4, fmtInt(h.atmAmount))}</td>
                <td>{pad("Bank Amount:", 4, fmt2(h.bankAmount))}</td>
              </tr>
              {/* Row 6 */}
              <tr>
                <td>{pad("Employer:", 21, h.employerId ?? "")}</td>
                <td colSpan={2} className={styles.center}>
                  {h.employerName}
                </td>
                <td />
                <td>{pad("Total Salary:", 12, fmtInt(h.totalSalary))}</td>
                <td />
                <td colSpan={2}>{pad("Status:", 16, h.status)}</td>
                <td />
              </tr>
              {/* Row 7: blank spacer row */}
              <tr className={styles.spacer}><td colSpan={9} /></tr>
            </tbody>
          </table>

          {/* ---------- Rows 8-39: bordered register ---------- */}
          <table className={`${styles.grid} ${styles.data}`}>
            <colgroup>
              {COL_PX.map((w, i) => (
                <col key={i} style={{ width: `${(w / COL_TOTAL) * 100}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee Molid</th>
                <th>Paymode</th>
                <th>Bank</th>
                <th>Account No</th>
                <th>No of Leaves</th>
                <th>Fix Amount</th>
                <th>Var Amount</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e: PayrollSlipEmployeeRow, i: number) => (
                <tr key={`${e.employeeMolId}-${i}`}>
                  <td>{e.employeeName}</td>
                  <td>{e.employeeMolId}</td>
                  <td>{e.payMode}</td>
                  <td>{e.bankName}</td>
                  <td>{e.accountNo ?? ""}</td>
                  <td>{e.numberOfLeaves}</td>
                  <td className={styles.num}><Accounting value={e.fixAmount} /></td>
                  <td className={styles.num}><Accounting value={e.varAmount} /></td>
                  <td className={styles.num}><Accounting value={e.totalAmount} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                {/* A39:F39 merged */}
                <td colSpan={6} className={styles.totalLabel}>Total</td>
                <td className={`${styles.num} ${styles.totalG}`}>
                  <Accounting value={totals.fixAmount} />
                </td>
                <td className={styles.num}>
                  <Accounting value={totals.varAmount} />
                </td>
                <td className={`${styles.num} ${styles.totalI}`}>
                  <Accounting value={totals.totalAmount} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
