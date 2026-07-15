const COMPANY = {
  name: 'Planet Transport Pvt Ltd.',
  regdOffice: 'Tengpora, Byepass Srinagar-190010',
  deliveryAddress: 'Tengpora Bypass, Near New City Hospital',
  phone: '9419428505, 9906661400',
};

function numToWords(n: number): string {
  if (!n || n === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
  };
  return convert(Math.round(n));
}

function PaymentVoucherHTML(expense: any): string {
  const voucherNo = expense.voucher_no || `PV-${String(expense.id).padStart(4, '0')}`;
  const dateStr = expense.expense_date ? new Date(expense.expense_date).toLocaleDateString('en-IN') : '-';
  const totalAmt = expense.total_amount || expense.amount || 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: A4; margin: 12mm; }
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #1e293b; }
        .watermark {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg);
          opacity: 0.03; pointer-events: none; z-index: 0;
        }
        .watermark svg { width: 500px; height: 330px; }
        .voucher-page { position: relative; z-index: 1; }
        .header { background: #dc2626; color: #fff; padding: 14px 20px; border-radius: 6px 6px 0 0; display: flex; align-items: center; gap: 14px; }
        .header .logo { width: 42px; height: 28px; flex-shrink: 0; }
        .header h1 { font-size: 16px; margin: 0; font-weight: 700; letter-spacing: 0.3px; }
        .header .sub { font-size: 9px; opacity: 0.85; margin-top: 1px; }
        .title-bar { background: #fef2f2; border-bottom: 2px solid #dc2626; text-align: center; padding: 8px; font-size: 13px; font-weight: 700; color: #dc2626; letter-spacing: 1px; }
        .section { padding: 12px 16px; border: 1px solid #e2e8f0; border-top: none; }
        .section-title { font-size: 10px; font-weight: 700; color: #dc2626; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; }
        .row { display: flex; padding: 3px 0; font-size: 11px; }
        .row .label { width: 130px; color: #64748b; flex-shrink: 0; }
        .row .value { flex: 1; font-weight: 500; color: #1e293b; }
        .details-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
        .details-table th { background: #f8fafc; text-align: left; padding: 5px 8px; font-size: 9px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .details-table td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; }
        .amount-box { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding: 10px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; }
        .amount-box .label { font-size: 10px; color: #dc2626; font-weight: 600; text-transform: uppercase; }
        .amount-box .amount { font-size: 16px; font-weight: 700; color: #dc2626; }
        .words { font-size: 10px; color: #475569; margin-top: 6px; font-style: italic; }
        .sign-row { display: flex; justify-content: space-between; margin-top: 24px; padding: 0 8px; }
        .sign-field { text-align: center; }
        .sign-field .line { width: 160px; border-top: 1px solid #94a3b8; margin-top: 32px; }
        .sign-field .label { font-size: 9px; color: #64748b; margin-top: 4px; }
        .footer { text-align: center; font-size: 8px; color: #94a3b8; margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
        .tag { display: inline-block; font-size: 9px; padding: 1px 6px; border-radius: 3px; background: #f1f5f9; color: #475569; }
      </style>
    </head>
    <body>
      <div class="watermark">
        <svg viewBox="0 0 468.62 308.07" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ef453c" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24ZM140.3,159.38c5.43-20.2,10.72-21.22-12.53-25.83-6.58-2.1-5.93,9.46-8.64,13.48-4.76,10.27,14.8,8.25,21.17,12.36ZM235.79,132.05c6.24-.95,4.53-15.02,7.61-20.62-2.49-3.49-16.04-6.4-18.28-.63-6.74,21.67-12.66,16.33,10.68,21.25ZM195.9,174.31c-5.08,4.63-7.12,12.65-3.31,19.31,11.39,7.55,17.62-24.24,3.31-19.31Z"/>
          <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
        </svg>
      </div>

      <div class="voucher-page">
        <div class="header">
          <svg class="logo" viewBox="0 0 468.62 308.07" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24ZM140.3,159.38c5.43-20.2,10.72-21.22-12.53-25.83-6.58-2.1-5.93,9.46-8.64,13.48-4.76,10.27,14.8,8.25,21.17,12.36ZM235.79,132.05c6.24-.95,4.53-15.02,7.61-20.62-2.49-3.49-16.04-6.4-18.28-.63-6.74,21.67-12.66,16.33,10.68,21.25ZM195.9,174.31c-5.08,4.63-7.12,12.65-3.31,19.31,11.39,7.55,17.62-24.24,3.31-19.31Z"/>
            <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
            <path fill="#ef453c" d="M384.85,123.81c-105.54-59.71-71.07-55.18-96.98,51.24-23.07,5.13,13.72-74.92,1.41-90.6-28.87-6.73-59.97-14.9-89.33-7.12-61.65,20.38-14.75,23.91,18.31,28.69-2.86,6.9-5.62,13.56-8.4,20.27-28.57-7.57-60.43-16.41-87.79-.38-10.15-1.73-20.52-11.45-29.76-17.08-3.81-2.51,1.93-3.81,1.39-7.01,47.27-143.49,264.07-127.22,291.16,21.99Z"/>
            <path fill="#2c2660" d="M140.3,159.38c-6.38-4.09-25.93-2.09-21.17-12.35,2.7-4.03,2.07-15.57,8.64-13.48,23.25,4.61,17.96,5.65,12.53,25.84Z"/>
            <path fill="#ef453c" d="M235.79,132.05c-23.36-4.91-17.4.39-10.68-21.25,2.26-5.81,15.78-2.84,18.28.62-3.07,5.62-1.37,19.66-7.61,20.63Z"/>
            <path fill="#2c2660" d="M195.9,174.31c13.85-4.72,8.66,25.42-2.88,19.76-4.53-6.39-2.23-15.13,2.88-19.76Z"/>
          </svg>
          <div>
            <h1>${COMPANY.name}</h1>
            <div class="sub">${COMPANY.regdOffice} | Phone: ${COMPANY.phone}</div>
          </div>
        </div>

        <div class="title-bar">PAYMENT VOUCHER</div>

        <div class="section">
          <div class="section-title">Basic Information</div>
          <div class="grid-2">
            <div class="row"><div class="label">Voucher No</div><div class="value">${voucherNo}</div></div>
            <div class="row"><div class="label">Voucher Date</div><div class="value">${dateStr}</div></div>
            <div class="row"><div class="label">Expense Type</div><div class="value">${expense.expense_type || '-'}</div></div>
            <div class="row"><div class="label">Category</div><div class="value">${expense.expense_category}</div></div>
            <div class="row"><div class="label">Status</div><div class="value"><span class="tag">${expense.status || 'Draft'}</span></div></div>
            ${expense.branch ? `<div class="row"><div class="label">Branch</div><div class="value">${expense.branch}</div></div>` : ''}
            ${expense.department ? `<div class="row"><div class="label">Department</div><div class="value">${expense.department}</div></div>` : ''}
            ${expense.vehicle_reg ? `<div class="row"><div class="label">Vehicle</div><div class="value">${expense.vehicle_reg}</div></div>` : ''}
          </div>
        </div>

        ${expense.vendor_name ? `
        <div class="section">
          <div class="section-title">Vendor / Payee Details</div>
          <div class="grid-2">
            <div class="row"><div class="label">Vendor Name</div><div class="value">${expense.vendor_name}</div></div>
            ${expense.vendor_code ? `<div class="row"><div class="label">Vendor Code</div><div class="value">${expense.vendor_code}</div></div>` : ''}
            ${expense.contact_person ? `<div class="row"><div class="label">Contact Person</div><div class="value">${expense.contact_person}</div></div>` : ''}
            ${expense.phone ? `<div class="row"><div class="label">Phone</div><div class="value">${expense.phone}</div></div>` : ''}
            ${expense.vendor_email ? `<div class="row"><div class="label">Email</div><div class="value">${expense.vendor_email}</div></div>` : ''}
            ${expense.vendor_address ? `<div class="row"><div class="label">Address</div><div class="value">${expense.vendor_address}</div></div>` : ''}
            ${expense.trn_vat_number ? `<div class="row"><div class="label">TRN/VAT</div><div class="value">${expense.trn_vat_number}</div></div>` : ''}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Expense Details</div>
          <table class="details-table">
            <thead>
              <tr>
                <th style="width:30px">#</th>
                <th>Particulars</th>
                <th style="width:60px">Qty</th>
                <th style="width:50px">Unit</th>
                <th style="width:70px;text-align:right">Rate</th>
                <th style="width:80px;text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>${expense.expense_head || expense.description || expense.expense_category}</td>
                <td>${expense.quantity || '-'}</td>
                <td>${expense.unit || '-'}</td>
                <td style="text-align:right">${expense.unit_cost ? expense.unit_cost.toLocaleString('en-IN') : '-'}</td>
                <td style="text-align:right">${expense.amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          ${expense.tax_percentage ? `
          <div style="display:flex;justify-content:flex-end;font-size:10px;margin-top:6px;gap:20px">
            <span>Tax (${expense.tax_percentage}%): <strong>${(expense.tax_amount || 0).toLocaleString('en-IN')}</strong></span>
          </div>
          ` : ''}

          <div class="amount-box">
            <div>
              <div class="label">Total Amount</div>
              <div class="words">Rupees ${numToWords(totalAmt)} Only</div>
            </div>
            <div class="amount">${expense.currency || 'INR'} ${totalAmt.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="grid-2">
            <div class="row"><div class="label">Payment Status</div><div class="value"><span class="tag">${expense.payment_status || 'Unpaid'}</span></div></div>
            <div class="row"><div class="label">Payment Mode</div><div class="value">${expense.payment_mode || 'Cash'}</div></div>
            ${expense.bank_account ? `<div class="row"><div class="label">Bank Account</div><div class="value">${expense.bank_account}</div></div>` : ''}
            ${expense.cheque_number ? `<div class="row"><div class="label">Cheque No</div><div class="value">${expense.cheque_number}</div></div>` : ''}
            ${expense.reference_no ? `<div class="row"><div class="label">Transaction Ref</div><div class="value">${expense.reference_no}</div></div>` : ''}
            ${expense.payment_date ? `<div class="row"><div class="label">Payment Date</div><div class="value">${new Date(expense.payment_date).toLocaleDateString('en-IN')}</div></div>` : ''}
          </div>
        </div>

        ${expense.notes ? `
        <div class="section">
          <div class="section-title">Internal Notes</div>
          <p style="font-size:10px;color:#475569;margin:0">${expense.notes}</p>
        </div>
        ` : ''}

        <div class="sign-row">
          <div class="sign-field"><div class="line"></div><div class="label">Prepared By</div></div>
          <div class="sign-field"><div class="line"></div><div class="label">Checked By</div></div>
          <div class="sign-field"><div class="line"></div><div class="label">Authorised Signatory</div></div>
        </div>

        <div class="footer">
          ${COMPANY.name} | ${COMPANY.regdOffice} | GSTIN: 01AAOCP0974B1ZQ
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printPaymentVoucher(expense: any) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(PaymentVoucherHTML(expense));
  win.document.close();
  setTimeout(() => { win.print(); }, 300);
}
