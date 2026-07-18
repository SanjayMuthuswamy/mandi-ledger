/**
 * Dynamic Invoice Renderer and Calculations Script
 * ─────────────────────────────────────────────────
 * IMPORTANT: Backend logic, data mapping, and API calls are NOT changed.
 * Only the renderInvoice() DOM wiring is extended to match the new HTML
 * template. All existing field IDs/variable names are preserved.
 */

// ── Sample mock data (defaultInvoiceData) ────────────────────────────────────
// Fields already present in the original are kept identical.
// New display-only fields (phone, email, pan, etc.) use the same naming
// convention and are sourced from the same invoice object.
const defaultInvoiceData = {
  // Company
  company_logo:    "logo.png",
  company_name:    "M B Bharath Rice Mundy",
  company_address: "Merku Veethi,\nKongarpalayam, Gobi\nErode 638506\nTamil Nadu",
  company_phone:   "+91 99942 80252, +91 95976 90100",
  company_email:   "-",
  company_gstin:   "33BNZPM4466K1Z6",
  company_pan:     "-",
  company_website: "-",

  // Invoice metadata
  invoice_number:  "INV-2023/24-1052",
  invoice_date:    "13/02/2024",
  due_date:        "27/02/2024",
  vehicle_number:  "TN 33 BJ 2122",
  payment_mode:    "NEFT",
  invoice_status:  "PENDING",   // PENDING | PARTIAL | PAID | OVERDUE
  po_number:       "DC-2023/24-1052",

  // Customer
  customer_name:    "Victory Mandi Ledger Agency",
  customer_mobile:  "+91 94321 54321",
  customer_address: "12, Market Main Road,\nTiruppur",
  customer_city:    "Tiruppur",
  customer_gstin:   "33ABCPV1234D1Z2",
  customer_state:   "Tamil Nadu (33)",
  customer_pin:     "641604",

  // Supply details
  place_of_supply:  "Tamil Nadu (33)",
  reverse_charge:   "No",
  transport_name:   "Sri Murugan Transport",
  delivery_note:    "DN-2023/24-052",

  // Items
  items: [
    {
      name:        "Boiled Rice – Elavarasar",
      description: "Per 26 Kg Bag",
      hsn:         "10063010",
      quantity:    50,
      unit:        "Bags",
      rate:        1640.00,
      discount:    0,
      gst_percent: 5,
    }
  ],

  // Bank / Payment
  bank_name:        "Canara Bank",
  account_number:   "123456789012",
  ifsc:             "CNRB0001234",
  upi_id:           "krgmills@cnrb",
  payment_status:   "PENDING",
  payment_mode_right: "NEFT",
  reference_number: "",

  // Notes
  terms_conditions: "Goods once sold will not be taken back.\nPayment due within 15 days of invoice date.",
  customer_notes:   "",
  remarks:          "",

  // Signature
  authorized_signatory: "Ravichandran",

  // Footer
  footer_email: "accounts@krgmills.com",
  footer_phone: "+91 98765 43210",
};

// ── numberToIndianRupeesWords() ──────────────────────────────────────────────
// (UNCHANGED from original)
function numberToIndianRupeesWords(amount) {
  const words = {
    0: '', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen',
    17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty',
    60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  const amountInt = Math.floor(amount);
  const amountDec = Math.round((amount - amountInt) * 100);

  function convertLessThanThousand(num) {
    let str = '';
    if (num >= 100) {
      str += words[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num > 0) {
      if (num < 20) {
        str += words[num];
      } else {
        str += words[Math.floor(num / 10) * 10];
        if (num % 10 > 0) {
          str += ' ' + words[num % 10];
        }
      }
    }
    return str.trim();
  }

  if (amountInt === 0) return 'Indian Rupee Zero Only';

  let result = '';
  let remaining = amountInt;

  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    result += convertLessThanThousand(crore) + ' Crore ';
    remaining %= 10000000;
  }
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    result += convertLessThanThousand(lakh) + ' Lakh ';
    remaining %= 100000;
  }
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    result += convertLessThanThousand(thousand) + ' Thousand ';
    remaining %= 1000;
  }
  if (remaining > 0) {
    result += convertLessThanThousand(remaining);
  }

  result = 'Indian Rupee ' + result.trim();
  if (amountDec > 0) {
    result += ' and ' + convertLessThanThousand(amountDec) + ' Paise';
  }
  return result.trim() + ' Only';
}

// ── Helper: set text if element exists ──────────────────────────────────────
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value || '';
}

// ── Helper: hide row/block if value is empty ─────────────────────────────────
function hideIfEmpty(rowId, value) {
  const el = document.getElementById(rowId);
  if (el && !value) el.classList.add('hidden');
}

// ── renderInvoice() ──────────────────────────────────────────────────────────
// Existing field IDs are unchanged. New IDs map to the new HTML sections.
function renderInvoice(data) {
  if (!data) return;

  // ── Company Logo ──────────────────────────────────────────────────────────
  const logoImg = document.getElementById('company-logo');
  if (logoImg) {
    if (data.company_logo) {
      logoImg.src = data.company_logo;
      logoImg.style.display = 'block';
    } else {
      logoImg.style.display = 'none';
    }
  }

  // ── Company Header ────────────────────────────────────────────────────────
  setText('company-name',    data.company_name);
  setText('company-address', data.company_address);
  setText('company-phone',   data.company_phone);
  setText('company-email',   data.company_email);
  setText('company-gstin',   data.company_gstin);
  setText('company-pan',     data.company_pan);
  hideIfEmpty('company-pan-row', data.company_pan);

  // ── Footer company info ───────────────────────────────────────────────────
  setText('company-website', data.company_website);
  setText('footer-email',    data.footer_email || data.company_email);
  setText('footer-phone',    data.footer_phone || data.company_phone);
  hideIfEmpty('website-sep', data.company_website);

  // ── Invoice Metadata Labels (dynamic translation for Reports) ─────────────
  const metaBoxHeader = document.querySelector('.inv-meta-heading');
  if (metaBoxHeader) {
    metaBoxHeader.innerText = data.is_report ? "Report Details" : "Invoice Details";
  }
  
  const labelsMap = {
    'invoice-number': data.is_report ? 'Report ID' : 'Invoice No.',
    'invoice-date': data.is_report ? 'Report Date' : 'Invoice Date',
    'due-date': data.is_report ? 'Date Range' : 'Due Date',
    'vehicle-number': data.is_report ? 'Total Quantity' : 'Vehicle No.',
    'payment-mode': data.is_report ? 'Total Records' : 'Payment Mode',
    'invoice-status': data.is_report ? 'Report Status' : 'Status'
  };
  
  for (const [id, labelText] of Object.entries(labelsMap)) {
    const el = document.getElementById(id);
    if (el) {
      const tr = el.closest('tr');
      if (tr) {
        const th = tr.querySelector('th');
        if (th) th.innerText = labelText;
      }
    }
  }

  // ── Invoice Metadata Values ───────────────────────────────────────────────
  setText('invoice-number',  data.invoice_number);
  setText('invoice-date',    data.invoice_date);
  setText('due-date',        data.due_date);
  hideIfEmpty('due-date-row', data.due_date);
  setText('vehicle-number',  data.vehicle_number);
  setText('payment-mode',    data.payment_mode);

  // Invoice Status badge
  const statusRow = document.getElementById('status-row');
  if (statusRow) {
    if (data.is_report) {
      statusRow.classList.add('hidden');
    } else {
      statusRow.classList.remove('hidden');
      const statusBadge = document.getElementById('invoice-status');
      if (statusBadge) {
        const s = data.invoice_status || data.paymentStatus || 'PENDING';
        statusBadge.innerText = s === 'PENDING' ? 'UNPAID' : s;
        statusBadge.className = 'status-badge status-' + s;
      }
    }
  }

  // ── Customer/Supplier Billing ─────────────────────────────────────────────
  setText('customer-name',    data.customer_name);
  setText('customer-mobile',  data.customer_mobile);
  setText('customer-address', data.customer_address);
  setText('customer-city',    data.customer_city);
  hideIfEmpty('cust-city-row', data.customer_city);
  setText('customer-gstin',   data.customer_gstin);
  hideIfEmpty('cust-gstin-row', data.customer_gstin);
  setText('customer-state',   data.customer_state || data.place_of_supply);
  setText('customer-pin',     data.customer_pin);
  hideIfEmpty('cust-pin-row', data.customer_pin);

  // ── Supply Details ────────────────────────────────────────────────────────
  setText('place-of-supply', data.place_of_supply);
  setText('reverse-charge',  data.reverse_charge);
  hideIfEmpty('rev-charge-row', data.reverse_charge);
  setText('transport-name',  data.transport_name);
  hideIfEmpty('transport-row', data.transport_name);
  setText('vehicle-sup',     data.vehicle_number);
  hideIfEmpty('vehicle-sup-row', data.vehicle_number);
  setText('delivery-note',   data.delivery_note);
  hideIfEmpty('delivery-note-row', data.delivery_note);
  setText('po-number',       data.po_number);

  // ── Dynamic Table Headers Setup ───────────────────────────────────────────
  const itemsTable = document.querySelector('.items-table');
  if (itemsTable) {
    if (data.is_report) {
      if (data.report_type === 'customer' || data.report_type === 'supplier') {
        itemsTable.innerHTML = `
          <thead>
            <tr>
              <th class="col-sno" style="width: 8%;">S.No</th>
              <th class="col-date" style="width: 15%;">Date</th>
              <th class="col-invoice" style="width: 15%;">Doc No.</th>
              <th class="col-variety" style="width: 25%;">Variety Name</th>
              <th class="col-qty" style="width: 12%;">Qty (Bags)</th>
              <th class="col-rate" style="width: 12%;">Rate (₹)</th>
              <th class="col-total" style="width: 13%;">Total (₹)</th>
            </tr>
          </thead>
          <tbody id="items-body"></tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="4">Totals</td>
              <td id="total-quantity" class="num-cell"></td>
              <td></td>
              <td id="subtotal" class="num-cell"></td>
            </tr>
          </tfoot>
        `;
      } else if (data.report_type === 'inventory') {
        itemsTable.innerHTML = `
          <thead>
            <tr>
              <th class="col-sno" style="width: 8%;">S.No</th>
              <th class="col-variety" style="width: 30%;">Rice Variety Name</th>
              <th class="col-qty" style="width: 20%;">Current Stock (kg)</th>
              <th class="col-rate" style="width: 20%;">Unit Price (₹/kg)</th>
              <th class="col-total" style="width: 22%;">Stock Value (₹)</th>
            </tr>
          </thead>
          <tbody id="items-body"></tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="2">Totals</td>
              <td id="total-quantity" class="num-cell"></td>
              <td></td>
              <td id="subtotal" class="num-cell"></td>
            </tr>
          </tfoot>
        `;
      } else {
        itemsTable.innerHTML = `
          <thead>
            <tr>
              <th class="col-sno" style="width: 8%;">S.No</th>
              <th class="col-date" style="width: 15%;">Date</th>
              <th class="col-invoice" style="width: 15%;">Doc No.</th>
              <th class="col-name" style="width: 25%;">${data.report_type === 'sales' ? 'Customer' : 'Supplier'}</th>
              <th class="col-variety" style="width: 15%;">Bags</th>
              <th class="col-total" style="width: 22%;">Total (₹)</th>
            </tr>
          </thead>
          <tbody id="items-body"></tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="4">Totals</td>
              <td id="total-quantity" class="num-cell"></td>
              <td id="subtotal" class="num-cell"></td>
            </tr>
          </tfoot>
        `;
      }
    } else {
      itemsTable.innerHTML = `
        <thead>
          <tr>
            <th class="col-sno">S.No</th>
            <th class="col-name">Item Name</th>
            <th class="col-desc">Description</th>
            <th class="col-hsn">HSN/SAC</th>
            <th class="col-qty">Qty</th>
            <th class="col-unit">Unit</th>
            <th class="col-rate">Rate (₹)</th>
            <th class="col-disc">Discount</th>
            <th class="col-gst">GST %</th>
            <th class="col-tax">Tax Amt (₹)</th>
            <th class="col-total">Total (₹)</th>
          </tr>
        </thead>
        <tbody id="items-body"></tbody>
        <tfoot>
          <tr class="totals-row">
            <td colspan="4">Totals</td>
            <td id="total-quantity" class="num-cell"></td>
            <td></td>
            <td></td>
            <td id="total-discount" class="num-cell"></td>
            <td></td>
            <td id="total-tax" class="num-cell"></td>
            <td id="subtotal" class="num-cell"></td>
          </tr>
        </tfoot>
      `;
    }
  }

  // ── Items Table Rows Rendering ────────────────────────────────────────────
  const itemsBody = document.getElementById('items-body');
  if (itemsBody) {
    itemsBody.innerHTML = '';

    let totalQty       = 0;
    let totalDiscount  = 0;
    let subtotal       = 0;
    let totalTax       = 0;

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'item-row';
        
        if (data.is_report) {
          totalQty += item.quantity;
          subtotal += item.total;
          
          if (data.report_type === 'customer' || data.report_type === 'supplier') {
            row.innerHTML = `
              <td class="col-sno">${index + 1}</td>
              <td class="col-date">${item.date}</td>
              <td class="col-invoice">${item.docNo}</td>
              <td class="col-variety">${item.varietyName}</td>
              <td class="col-qty">${item.quantity.toLocaleString()}</td>
              <td class="col-rate">${item.rate.toFixed(2)}</td>
              <td class="col-total">${item.total.toFixed(2)}</td>
            `;
          } else if (data.report_type === 'inventory') {
            row.innerHTML = `
              <td class="col-sno">${index + 1}</td>
              <td class="col-variety">${item.varietyName}</td>
              <td class="col-qty">${item.quantity.toLocaleString()}</td>
              <td class="col-rate">${item.rate.toFixed(2)}</td>
              <td class="col-total">${item.total.toFixed(2)}</td>
            `;
          } else {
            row.innerHTML = `
              <td class="col-sno">${index + 1}</td>
              <td class="col-date">${item.date}</td>
              <td class="col-invoice">${item.docNo}</td>
              <td class="col-name">${item.name}</td>
              <td class="col-variety">${item.quantity.toLocaleString()} Bags</td>
              <td class="col-total">${item.total.toFixed(2)}</td>
            `;
          }
        } else {
          const itemBase     = item.quantity * item.rate;
          const itemDiscount = item.discount || 0;
          const taxable      = itemBase - itemDiscount;
          const gstPct       = item.gst_percent || 0;
          const taxAmt       = +(taxable * gstPct / 100).toFixed(2);
          const itemTotal    = taxable + taxAmt;

          totalQty      += item.quantity;
          totalDiscount += itemDiscount;
          subtotal      += itemTotal;
          totalTax      += taxAmt;

          row.innerHTML = `
            <td class="col-sno">${index + 1}</td>
            <td class="col-name">${item.name || item.description || ''}</td>
            <td class="col-desc">${item.description || ''}</td>
            <td class="col-hsn">${item.hsn || ''}</td>
            <td class="col-qty">${item.quantity.toLocaleString()}</td>
            <td class="col-unit">${item.unit || 'Bags'}</td>
            <td class="col-rate">${item.rate.toFixed(2)}</td>
            <td class="col-disc">${itemDiscount > 0 ? itemDiscount.toFixed(2) : '—'}</td>
            <td class="col-gst">${gstPct > 0 ? gstPct + '%' : '—'}</td>
            <td class="col-tax">${taxAmt > 0 ? taxAmt.toFixed(2) : '—'}</td>
            <td class="col-total">${itemTotal.toFixed(2)}</td>
          `;
        }
        itemsBody.appendChild(row);
      });
    }

    const fmtINR = (v) => '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Update tfoot totals
    setText('total-quantity', data.report_type === 'inventory' ? totalQty.toLocaleString() + ' kg' : totalQty.toLocaleString());
    if (!data.is_report) {
      setText('total-discount', totalDiscount > 0 ? totalDiscount.toFixed(2) : '—');
      setText('total-tax',      totalTax > 0 ? totalTax.toFixed(2) : '—');
    }
    setText('subtotal', subtotal.toFixed(2));

    // Update summary totals
    const grandTotal = subtotal;
    setText('total', fmtINR(grandTotal));

    if (!data.is_report) {
      const taxableAmt = subtotal - totalTax;
      setText('subtotal-display', fmtINR(subtotal));
      setText('taxable-amount',   fmtINR(taxableAmt));

      if (totalDiscount > 0) {
        setText('discount-display', '- ' + fmtINR(totalDiscount));
      } else {
        hideIfEmpty('discount-row', '');
      }
      
      const isInterstate = (data.place_of_supply || '').toLowerCase().indexOf('33') === -1 ||
                           (data.customer_gstin || '').substring(0, 2) !== '33';
      if (isInterstate) {
        setText('igst-amount', fmtINR(totalTax));
        hideIfEmpty('cgst-row', '');
        hideIfEmpty('sgst-row', '');
      } else {
        setText('cgst-amount', fmtINR(totalTax / 2));
        setText('sgst-amount', fmtINR(totalTax / 2));
        hideIfEmpty('igst-row', '');
      }
      if (totalTax === 0) {
        hideIfEmpty('cgst-row', '');
        hideIfEmpty('sgst-row', '');
        hideIfEmpty('igst-row', '');
      }

      const rounded   = Math.round(grandTotal);
      const roundOff  = +(rounded - grandTotal).toFixed(2);
      if (roundOff !== 0) {
        setText('round-off', (roundOff >= 0 ? '+ ' : '') + fmtINR(Math.abs(roundOff)));
      } else {
        hideIfEmpty('roundoff-row', '');
      }
      setText('total', fmtINR(rounded || grandTotal));
      setText('amount-in-words', numberToIndianRupeesWords(rounded || grandTotal));
    }
  }

  // ── Bank, Notes, Signature Layout Configuration ──────────────────────────
  const amountWordsBox = document.querySelector('.amount-words-box');
  const paymentInfoCard = document.querySelector('.payment-info-card');
  const notesCard = document.getElementById('notes-card');
  const signatureSection = document.querySelector('.signature-section');
  const supplyCard = document.querySelector('.supply-card');
  
  if (data.is_report) {
    if (amountWordsBox) amountWordsBox.style.display = 'none';
    if (paymentInfoCard) paymentInfoCard.style.display = 'none';
    if (notesCard) notesCard.style.display = 'none';
    if (signatureSection) signatureSection.style.display = 'none';
    if (supplyCard) supplyCard.style.display = 'none';
    
    // Hide details invoice fields not used in report summary card
    hideIfEmpty('discount-row', '');
    hideIfEmpty('cgst-row', '');
    hideIfEmpty('sgst-row', '');
    hideIfEmpty('igst-row', '');
    hideIfEmpty('roundoff-row', '');
    
    const subtotalDisplayRow = document.getElementById('subtotal-display')?.closest('.totals-row-item');
    if (subtotalDisplayRow) subtotalDisplayRow.style.display = 'none';
    
    const taxableAmountRow = document.getElementById('taxable-amount')?.closest('.totals-row-item');
    if (taxableAmountRow) taxableAmountRow.style.display = 'none';
  } else {
    if (amountWordsBox) amountWordsBox.style.display = '';
    if (paymentInfoCard) paymentInfoCard.style.display = '';
    if (notesCard) notesCard.style.display = '';
    if (signatureSection) signatureSection.style.display = '';
    if (supplyCard) supplyCard.style.display = '';

    // ── Bank & Payment values ───────────────────────────────────────────────
    setText('bank-name',       data.bank_name);
    setText('account-number',  data.account_number);
    setText('ifsc',            data.ifsc);
    setText('upi-id',          data.upi_id);
    hideIfEmpty('upi-row',     data.upi_id);

    const payStatusEl = document.getElementById('pay-status');
    if (payStatusEl) {
      const ps = data.payment_status || data.invoice_status || 'PENDING';
      payStatusEl.innerText = ps === 'PENDING' ? 'UNPAID' : ps;
      payStatusEl.className = 'status-badge status-' + ps;
    }

    setText('pay-mode-right',   data.payment_mode_right || data.payment_mode);
    setText('reference-number', data.reference_number);
    hideIfEmpty('ref-row',      data.reference_number);

    // ── Notes values ────────────────────────────────────────────────────────
    const terms = data.terms_conditions !== undefined ? data.terms_conditions : "Goods once sold will not be taken back.\nPayment due within 15 days of invoice date.";
    setText('terms-conditions', terms);
    hideIfEmpty('terms-block',  terms);
    setText('customer-notes',   data.customer_notes);
    hideIfEmpty('cust-notes-block', data.customer_notes);
    setText('remarks',          data.remarks);
    hideIfEmpty('remarks-block', data.remarks);

    if (notesCard && !data.terms_conditions && !data.customer_notes && !data.remarks) {
      notesCard.classList.add('hidden');
    }

    // ── Signature values ────────────────────────────────────────────────────
    setText('authorized-signatory',  data.authorized_signatory);
    setText('signatory-company-name', data.company_name);
  }

  // ── Requested By ──────────────────────────────────────────────────────────
  const reqContainer = document.getElementById('requested-by-container');
  const reqUserEl = document.getElementById('requested-by-user');
  if (reqContainer && reqUserEl) {
    if (data.requested_by) {
      reqUserEl.innerText = data.requested_by;
      reqContainer.style.display = 'inline';
    } else {
      reqContainer.style.display = 'none';
    }
  }
}

// ── Auto-render on page load ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const saleId = urlParams.get('saleId');
  const purchaseId = urlParams.get('purchaseId');
  const customerId = urlParams.get('customerId');
  const supplierId = urlParams.get('supplierId');
  const reportType = urlParams.get('reportType');

  if (saleId) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch requesting user details in parallel
      let requestingUser = null;
      try {
        const meResponse = await fetch(`${API_URL}/auth/me`, { headers });
        if (meResponse.ok) {
          requestingUser = await meResponse.json();
        }
      } catch (e) {
        console.error("Failed to fetch requesting user details", e);
      }

      const response = await fetch(`${API_URL}/sales/${saleId}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch sale details');
      }
      const sale = await response.json();
      
      // Parse customer address for city and pin code
      let customerAddress = sale.customer?.address || "-";
      let customerCity = "-";
      let customerPin = "-";
      
      const pinMatch = customerAddress.match(/\b\d{6}\b/);
      if (pinMatch) {
        customerPin = pinMatch[0];
        customerAddress = customerAddress.replace(pinMatch[0], "").trim();
      }
      customerAddress = customerAddress.replace(/,?\s*$/, "").trim(); // Clean trailing commas
      
      const addressParts = customerAddress.split(/,\s*/);
      if (addressParts.length > 1) {
        customerCity = addressParts[addressParts.length - 1];
      }
      
      // Map sale fields to defaultInvoiceData shape
      const invoiceData = {
        company_logo:    "logo.png",
        company_name:    "M B Bharath Rice Mundy",
        company_address: "Merku Veethi,\nKongarpalayam, Gobi\nErode 638506\nTamil Nadu",
        company_phone:   "+91 99942 80252, +91 95976 90100",
        company_email:   "-",
        company_gstin:   "33BNZPM4466K1Z6",
        company_pan:     "-",
        company_website: "-",

        // Invoice metadata
        invoice_number:  sale.invoiceNo,
        invoice_date:    new Date(sale.saleDate).toLocaleDateString('en-GB'),
        due_date:        new Date(sale.saleDate).toLocaleDateString('en-GB'),
        vehicle_number:  sale.vehicleNo || "-",
        payment_mode:    sale.paymentMethod || "-",
        invoice_status:  sale.paymentStatus,
        po_number:       "-",

        // Customer
        customer_name:    sale.customer?.name,
        customer_mobile:  sale.customer?.phone || "-",
        customer_address: customerAddress,
        customer_city:    customerCity,
        customer_gstin:   sale.customer?.gstNumber || "-",
        customer_state:   "Tamil Nadu (33)",
        customer_pin:     customerPin,

        // Supply details
        place_of_supply:  "Tamil Nadu (33)",
        reverse_charge:   "No",
        transport_name:   "-",
        delivery_note:    "-",

        // Items
        items: (sale.items || []).map(item => ({
          name: item.variety?.name,
          description: `${item.quantity} Bags (${item.kgPerBag || 26} kg/bag)`,
          hsn: "1006",
          quantity: item.quantity,
          unit: "Bags",
          rate: item.rate,
          discount: 0,
          gst_percent: 5,
        })),

        // Bank details
        bank_name: "HDFC Bank Ltd",
        account_number: "50200012345678",
        ifsc: "HDFC0001234",
        upi_id: "krgmills@hdfcbank",
        authorized_signatory: requestingUser ? `${requestingUser.firstName} ${requestingUser.lastName}` : "Ravichandran",
        
        // Requesting user details
        requested_by: requestingUser ? `${requestingUser.firstName} ${requestingUser.lastName} (${requestingUser.role?.name || 'User'})` : null,
      };

      renderInvoice(invoiceData);
    } catch (err) {
      console.error(err);
      alert('Error loading invoice: ' + err.message);
      renderInvoice(defaultInvoiceData);
    }
  } else if (purchaseId) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch requesting user details in parallel
      let requestingUser = null;
      try {
        const meResponse = await fetch(`${API_URL}/auth/me`, { headers });
        if (meResponse.ok) {
          requestingUser = await meResponse.json();
        }
      } catch (e) {
        console.error("Failed to fetch requesting user details", e);
      }

      const response = await fetch(`${API_URL}/purchases/${purchaseId}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch purchase details');
      }
      const purchase = await response.json();

      // Change label of invoice to "PURCHASE RECORD"
      const taxInvoiceLabel = document.querySelector('.tax-invoice-label');
      if (taxInvoiceLabel) {
        taxInvoiceLabel.innerText = "PURCHASE RECORD";
      }
      
      const billToLabel = document.querySelector('.bill-to-card .card-heading');
      if (billToLabel) {
        billToLabel.innerText = "Supplier Details";
      }

      // Parse supplier address for city and pin code
      let supplierAddress = purchase.supplier?.address || "-";
      let supplierCity = "-";
      let supplierPin = "-";
      
      const pinMatch = supplierAddress.match(/\b\d{6}\b/);
      if (pinMatch) {
        supplierPin = pinMatch[0];
        supplierAddress = supplierAddress.replace(pinMatch[0], "").trim();
      }
      supplierAddress = supplierAddress.replace(/,?\s*$/, "").trim(); // Clean trailing commas
      
      const addressParts = supplierAddress.split(/,\s*/);
      if (addressParts.length > 1) {
        supplierCity = addressParts[addressParts.length - 1];
      }

      // Map purchase fields to defaultInvoiceData shape
      const invoiceData = {
        company_logo:    "logo.png",
        company_name:    "M B Bharath Rice Mundy",
        company_address: "Merku Veethi,\nKongarpalayam, Gobi\nErode 638506\nTamil Nadu",
        company_phone:   "+91 99942 80252, +91 95976 90100",
        company_email:   "-",
        company_gstin:   "33BNZPM4466K1Z6",
        company_pan:     "-",
        company_website: "-",

        // Metadata
        invoice_number:  purchase.entryNo,
        invoice_date:    new Date(purchase.purchaseDate).toLocaleDateString('en-GB'),
        due_date:        new Date(purchase.purchaseDate).toLocaleDateString('en-GB'),
        vehicle_number:  "-",
        payment_mode:    "-",
        invoice_status:  purchase.paymentStatus,
        po_number:       "-",

        // Supplier (in place of Customer)
        customer_name:    purchase.supplier?.name,
        customer_mobile:  purchase.supplier?.phone || "-",
        customer_address: supplierAddress,
        customer_city:    supplierCity,
        customer_gstin:   purchase.supplier?.gstNumber || "-",
        customer_state:   "Tamil Nadu (33)",
        customer_pin:     supplierPin,

        // Supply details
        place_of_supply:  "Tamil Nadu (33)",
        reverse_charge:   "No",
        transport_name:   "-",
        delivery_note:    "-",

        // Items
        items: (purchase.items || []).map(item => ({
          name: item.variety?.name,
          description: `${item.quantity} Bags (${item.kgPerBag || 26} kg/bag)`,
          hsn: "1006",
          quantity: item.quantity,
          unit: "Bags",
          rate: item.rate,
          discount: 0,
          gst_percent: 0, // Purchases do not list sales GST in our entry
        })),

        // Bank details
        bank_name: "-",
        account_number: "-",
        ifsc: "-",
        upi_id: "-",
        
        // Requesting user details
        requested_by: requestingUser ? `${requestingUser.firstName} ${requestingUser.lastName} (${requestingUser.role?.name || 'User'})` : null,
      };

      renderInvoice(invoiceData);
    } catch (err) {
      console.error(err);
      alert('Error loading purchase record: ' + err.message);
      renderInvoice(defaultInvoiceData);
    }
  } else if (customerId) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/customers/${customerId}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch customer details');
      const customer = await response.json();

      // Retrieve date range filters if passed
      const startDate = urlParams.get('startDate') || '';
      const endDate = urlParams.get('endDate') || '';
      let dateRangeStr = 'All Time';
      if (startDate || endDate) {
        dateRangeStr = `${startDate || 'Start'} to ${endDate || 'End'}`;
      }

      // Filter customer sales by dates
      const filteredSales = (customer.sales || []).filter(s => {
        const dateStr = s.saleDate?.split('T')[0];
        if (startDate && dateStr < startDate) return false;
        if (endDate && dateStr > endDate) return false;
        return true;
      });

      // Change label of invoice to "CUSTOMER LEDGER"
      const taxInvoiceLabel = document.querySelector('.tax-invoice-label');
      if (taxInvoiceLabel) taxInvoiceLabel.innerText = "CUSTOMER LEDGER";
      
      const subtitleLabel = document.querySelector('.invoice-subtitle');
      if (subtitleLabel) subtitleLabel.innerText = "Sales Transaction History";

      const billToLabel = document.querySelector('.bill-to-card .card-heading');
      if (billToLabel) billToLabel.innerText = "Customer Details";

      // Parse customer address for city and pin code
      let customerAddress = customer.address || "-";
      let customerCity = "-";
      let customerPin = "-";
      
      const pinMatch = customerAddress.match(/\b\d{6}\b/);
      if (pinMatch) {
        customerPin = pinMatch[0];
        customerAddress = customerAddress.replace(pinMatch[0], "").trim();
      }
      customerAddress = customerAddress.replace(/,?\s*$/, "").trim(); // Clean trailing commas
      
      const addressParts = customerAddress.split(/,\s*/);
      if (addressParts.length > 1) {
        customerCity = addressParts[addressParts.length - 1];
      }

      const totalQty = filteredSales.reduce((acc, s) => acc + (s.items?.[0]?.quantity || 0), 0);

      // Prepare items list for table: S.No, Date, Doc No., Variety, Bags, Rate, Total Amount
      const items = filteredSales.map(s => ({
        date: new Date(s.saleDate).toLocaleDateString('en-GB'),
        docNo: s.invoiceNo,
        varietyName: s.items?.[0]?.variety?.name || "-",
        quantity: s.items?.[0]?.quantity || 0,
        rate: s.items?.[0]?.rate || 0,
        total: s.totalAmount
      }));

      // Map to renderInvoice structure
      const invoiceData = {
        company_logo:    "logo.png",
        company_name:    "M B Bharath Rice Mundy",
        company_address: "Merku Veethi,\nKongarpalayam, Gobi\nErode 638506\nTamil Nadu",
        company_phone:   "+91 99942 80252, +91 95976 90100",
        company_email:   "-",
        company_gstin:   "33BNZPM4466K1Z6",
        company_pan:     "-",
        company_website: "-",

        is_report: true,
        report_type: 'customer',

        invoice_number:  `CUST-REP-${customer.id.substring(0, 5).toUpperCase()}`,
        invoice_date:    new Date().toLocaleDateString('en-GB'),
        due_date:        dateRangeStr,
        vehicle_number:  `${totalQty.toLocaleString()} Bags`,
        payment_mode:    `${filteredSales.length} Transactions`,
        invoice_status:  "GENERATED",

        // Customer details
        customer_name:    customer.name,
        customer_mobile:  customer.phone || "-",
        customer_address: customerAddress,
        customer_city:    customerCity,
        customer_gstin:   customer.gstNumber || "-",
        customer_state:   "Tamil Nadu (33)",
        customer_pin:     customerPin,

        items: items
      };

      renderInvoice(invoiceData);
    } catch (err) {
      console.error(err);
      alert('Error loading customer report: ' + err.message);
      renderInvoice(defaultInvoiceData);
    }
  } else if (supplierId) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/suppliers/${supplierId}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch supplier details');
      const supplier = await response.json();

      // Retrieve date range filters if passed
      const startDate = urlParams.get('startDate') || '';
      const endDate = urlParams.get('endDate') || '';
      let dateRangeStr = 'All Time';
      if (startDate || endDate) {
        dateRangeStr = `${startDate || 'Start'} to ${endDate || 'End'}`;
      }

      // Filter supplier purchases by dates
      const filteredPurchases = (supplier.purchases || []).filter(p => {
        const dateStr = p.purchaseDate?.split('T')[0];
        if (startDate && dateStr < startDate) return false;
        if (endDate && dateStr > endDate) return false;
        return true;
      });

      // Change label of invoice to "SUPPLIER LEDGER"
      const taxInvoiceLabel = document.querySelector('.tax-invoice-label');
      if (taxInvoiceLabel) taxInvoiceLabel.innerText = "SUPPLIER LEDGER";
      
      const subtitleLabel = document.querySelector('.invoice-subtitle');
      if (subtitleLabel) subtitleLabel.innerText = "Purchase Transaction History";

      const billToLabel = document.querySelector('.bill-to-card .card-heading');
      if (billToLabel) billToLabel.innerText = "Supplier Details";

      // Parse supplier address for city and pin code
      let supplierAddress = supplier.address || "-";
      let supplierCity = "-";
      let supplierPin = "-";
      
      const pinMatch = supplierAddress.match(/\b\d{6}\b/);
      if (pinMatch) {
        supplierPin = pinMatch[0];
        supplierAddress = supplierAddress.replace(pinMatch[0], "").trim();
      }
      supplierAddress = supplierAddress.replace(/,?\s*$/, "").trim(); // Clean trailing commas
      
      const addressParts = supplierAddress.split(/,\s*/);
      if (addressParts.length > 1) {
        supplierCity = addressParts[addressParts.length - 1];
      }

      const totalQty = filteredPurchases.reduce((acc, p) => acc + (p.items?.[0]?.quantity || 0), 0);

      // Prepare items list for table: S.No, Date, Doc No., Variety, Bags, Rate, Total Amount
      const items = filteredPurchases.map(p => ({
        date: new Date(p.purchaseDate).toLocaleDateString('en-GB'),
        docNo: p.entryNo,
        varietyName: p.items?.[0]?.variety?.name || "-",
        quantity: p.items?.[0]?.quantity || 0,
        rate: p.items?.[0]?.rate || 0,
        total: p.totalAmount
      }));

      // Map to renderInvoice structure
      const invoiceData = {
        company_logo:    "logo.png",
        company_name:    "M B Bharath Rice Mundy",
        company_address: "Merku Veethi,\nKongarpalayam, Gobi\nErode 638506\nTamil Nadu",
        company_phone:   "+91 99942 80252, +91 95976 90100",
        company_email:   "-",
        company_gstin:   "33BNZPM4466K1Z6",
        company_pan:     "-",
        company_website: "-",

        is_report: true,
        report_type: 'supplier',

        invoice_number:  `SUPP-REP-${supplier.id.substring(0, 5).toUpperCase()}`,
        invoice_date:    new Date().toLocaleDateString('en-GB'),
        due_date:        dateRangeStr,
        vehicle_number:  `${totalQty.toLocaleString()} Bags`,
        payment_mode:    `${filteredPurchases.length} Transactions`,
        invoice_status:  "GENERATED",

        // Supplier details
        customer_name:    supplier.name,
        customer_mobile:  supplier.phone || "-",
        customer_address: supplierAddress,
        customer_city:    supplierCity,
        customer_gstin:   supplier.gstNumber || "-",
        customer_state:   "Tamil Nadu (33)",
        customer_pin:     supplierPin,

        items: items
      };

      renderInvoice(invoiceData);
    } catch (err) {
      console.error(err);
      alert('Error loading supplier report: ' + err.message);
      renderInvoice(defaultInvoiceData);
    }
  } else if (reportType) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Hide the bill-to-card and billing-supply-grid completely since this is a general list
      const billingSupplyGrid = document.querySelector('.billing-supply-grid');
      if (billingSupplyGrid) {
        billingSupplyGrid.style.display = 'none';
      }

      // Retrieve date range filters if passed
      const startDate = urlParams.get('startDate') || '';
      const endDate = urlParams.get('endDate') || '';
      let dateRangeStr = 'All Time';
      if (startDate || endDate) {
        dateRangeStr = `${startDate || 'Start'} to ${endDate || 'End'}`;
      }

      let items = [];
      let totalQty = 0;
      let totalValue = 0;
      let reportName = "";
      let subtitle = "";

      if (reportType === 'inventory') {
        const response = await fetch(`${API_URL}/stock`, { headers });
        if (!response.ok) throw new Error('Failed to fetch stock inventory');
        const stock = await response.json();

        reportName = "INVENTORY LEDGER";
        subtitle = "Current Stock Levels and Valuation";
        totalQty = stock.reduce((sum, item) => sum + item.quantity, 0);
        totalValue = stock.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        items = stock.map(item => ({
          varietyName: item.varietyName,
          quantity: item.quantity,
          rate: item.price,
          total: item.quantity * item.price
        }));
      } else if (reportType === 'sales') {
        const response = await fetch(`${API_URL}/sales?limit=100`, { headers });
        if (!response.ok) throw new Error('Failed to fetch sales records');
        const salesRes = await response.json();
        const sales = salesRes.data || [];

        reportName = "SALES REPORT";
        subtitle = "General Sales Transaction Ledger";

        // Filter by date range
        const filteredSales = sales.filter(s => {
          const dateStr = s.saleDate?.split('T')[0];
          if (startDate && dateStr < startDate) return false;
          if (endDate && dateStr > endDate) return false;
          return true;
        });

        totalQty = filteredSales.reduce((sum, s) => sum + (s.items?.[0]?.quantity || 0), 0);
        totalValue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);

        items = filteredSales.map(s => ({
          date: new Date(s.saleDate).toLocaleDateString('en-GB'),
          docNo: s.invoiceNo,
          name: s.customer?.name || "-",
          quantity: s.items?.[0]?.quantity || 0,
          total: s.totalAmount
        }));
      } else if (reportType === 'purchases') {
        const response = await fetch(`${API_URL}/purchases?limit=100`, { headers });
        if (!response.ok) throw new Error('Failed to fetch purchase records');
        const purchasesRes = await response.json();
        const purchases = purchasesRes.data || [];

        reportName = "PURCHASE LEDGER";
        subtitle = "General Grain Purchases Transaction Ledger";

        // Filter by date range
        const filteredPurchases = purchases.filter(p => {
          const dateStr = p.purchaseDate?.split('T')[0];
          if (startDate && dateStr < startDate) return false;
          if (endDate && dateStr > endDate) return false;
          return true;
        });

        totalQty = filteredPurchases.reduce((sum, p) => sum + (p.items?.[0]?.quantity || 0), 0);
        totalValue = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

        items = filteredPurchases.map(p => ({
          date: new Date(p.purchaseDate).toLocaleDateString('en-GB'),
          docNo: p.entryNo,
          name: p.supplier?.name || "-",
          quantity: p.items?.[0]?.quantity || 0,
          total: p.totalAmount
        }));
      }

      // Change label of invoice
      const taxInvoiceLabel = document.querySelector('.tax-invoice-label');
      if (taxInvoiceLabel) taxInvoiceLabel.innerText = reportName;
      
      const subtitleLabel = document.querySelector('.invoice-subtitle');
      if (subtitleLabel) subtitleLabel.innerText = subtitle;

      // Map to renderInvoice structure
      const invoiceData = {
        company_logo:    "logo.png",
        company_name:    "M B Bharath Rice Mundy",
        company_address: "Merku Veethi,\nKongarpalayam, Gobi\nErode 638506\nTamil Nadu",
        company_phone:   "+91 99942 80252, +91 95976 90100",
        company_email:   "-",
        company_gstin:   "33BNZPM4466K1Z6",
        company_pan:     "-",
        company_website: "-",

        is_report: true,
        report_type: reportType,

        invoice_number:  `${reportType.toUpperCase()}-REP`,
        invoice_date:    new Date().toLocaleDateString('en-GB'),
        due_date:        dateRangeStr,
        vehicle_number:  reportType === 'inventory' ? `${totalQty.toLocaleString()} kg` : `${totalQty.toLocaleString()} Bags`,
        payment_mode:    `${items.length} Entries`,
        invoice_status:  "GENERATED",

        items: items
      };

      renderInvoice(invoiceData);
    } catch (err) {
      console.error(err);
      alert('Error loading report: ' + err.message);
      renderInvoice(defaultInvoiceData);
    }
  } else {
    renderInvoice(defaultInvoiceData);
  }

  // Set up download PDF action
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const element = document.querySelector('.invoice-document');
      const docNo = document.getElementById('invoice-number')?.innerText || 'document';
      const companyName = 'MB-BHARATH-RICE-MUNDY';
      const opt = {
        margin:       0,
        filename:     `${companyName}-${docNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    });
  }
});
