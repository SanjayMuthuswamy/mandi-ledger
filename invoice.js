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
  company_name:    "MB BHARATH RICE MUNDY",
  company_address: "Kongarpalayam, Gobi.\nPin code: 638 506",
  company_phone:   "+91 99942 80252, +91 95976 90100",
  company_email:   "-",
  company_gstin:   "-",
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
  terms_conditions: "Goods once sold will not be taken back.\nPayment due within 15 days of invoice date.\nSubject to Erode jurisdiction.",
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

  // ── Invoice Metadata ──────────────────────────────────────────────────────
  setText('invoice-number',  data.invoice_number);
  setText('invoice-date',    data.invoice_date);
  setText('due-date',        data.due_date);
  hideIfEmpty('due-date-row', data.due_date);
  setText('vehicle-number',  data.vehicle_number);
  setText('payment-mode',    data.payment_mode);

  // Invoice Status badge
  const statusBadge = document.getElementById('invoice-status');
  if (statusBadge) {
    const s = data.invoice_status || data.paymentStatus || 'PENDING';
    statusBadge.innerText = s === 'PENDING' ? 'UNPAID' : s;
    statusBadge.className = 'status-badge status-' + s;
  }

  // ── Customer Billing ──────────────────────────────────────────────────────
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

  // ── Items Table ───────────────────────────────────────────────────────────
  const itemsBody = document.getElementById('items-body');
  if (itemsBody) {
    itemsBody.innerHTML = '';

    let totalQty       = 0;
    let totalDiscount  = 0;
    let subtotal       = 0;
    let totalTax       = 0;

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
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

        const row = document.createElement('tr');
        row.className = 'item-row';
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
        itemsBody.appendChild(row);
      });
    }

    // ── tfoot totals ─────────────────────────────────────────────────────
    const fmtINR = (v) => '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    setText('total-quantity', totalQty.toLocaleString());
    setText('total-discount', totalDiscount > 0 ? totalDiscount.toFixed(2) : '—');
    setText('total-tax',      totalTax > 0 ? totalTax.toFixed(2) : '—');
    setText('subtotal',       subtotal.toFixed(2));

    // ── Summary totals ────────────────────────────────────────────────────
    // Taxable amount = subtotal - tax
    const taxableAmt = subtotal - totalTax;
    const grandTotal = subtotal;

    setText('subtotal-display', fmtINR(subtotal));
    setText('taxable-amount',   fmtINR(taxableAmt));

    // Discount row
    if (totalDiscount > 0) {
      setText('discount-display', '- ' + fmtINR(totalDiscount));
    } else {
      hideIfEmpty('discount-row', '');
    }

    // GST split: CGST + SGST (intrastate) or IGST (interstate)
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

    // Round off
    const rounded   = Math.round(grandTotal);
    const roundOff  = +(rounded - grandTotal).toFixed(2);
    if (roundOff !== 0) {
      setText('round-off', (roundOff >= 0 ? '+ ' : '') + fmtINR(Math.abs(roundOff)));
    } else {
      hideIfEmpty('roundoff-row', '');
    }

    // Grand total (existing ID preserved)
    setText('total', fmtINR(rounded || grandTotal));

    // Amount in Words (existing ID preserved)
    setText('amount-in-words', numberToIndianRupeesWords(rounded || grandTotal));
  }

  // ── Bank & Payment ────────────────────────────────────────────────────────
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

  // ── Notes ─────────────────────────────────────────────────────────────────
  setText('terms-conditions', data.terms_conditions);
  hideIfEmpty('terms-block',  data.terms_conditions);
  setText('customer-notes',   data.customer_notes);
  hideIfEmpty('cust-notes-block', data.customer_notes);
  setText('remarks',          data.remarks);
  hideIfEmpty('remarks-block', data.remarks);

  // Hide entire notes card if all empty
  const notesCard = document.getElementById('notes-card');
  if (notesCard && !data.terms_conditions && !data.customer_notes && !data.remarks) {
    notesCard.classList.add('hidden');
  }

  // ── Signature ─────────────────────────────────────────────────────────────
  setText('authorized-signatory',  data.authorized_signatory);
  setText('signatory-company-name', data.company_name);

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
        company_name:    "MB BHARATH RICE MUNDY",
        company_address: "Kongarpalayam, Gobi.\nPin code: 638 506",
        company_phone:   "+91 99942 80252, +91 95976 90100",
        company_email:   "-",
        company_gstin:   "-",
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
  } else {
    renderInvoice(defaultInvoiceData);
  }
});
