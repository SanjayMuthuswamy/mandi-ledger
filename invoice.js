/**
 * Dynamic Invoice Renderer and Calculations Script
 */

// Sample mock data based on INV-202324-1052 (1).pdf
const defaultInvoiceData = {
  company_logo: "https://via.placeholder.com/120x80?text=KRG+LOGO",
  company_name: "KRG Modern Rice Mills",
  company_address: "356/3, Karumandamapalayam,\nMalayamapalayam PO\nErode Tamil Nadu 638154",
  company_gstin: "33AAHFK3755D1ZK",
  
  invoice_number: "INV-2023/24-1052",
  invoice_date: "13/02/2024",
  po_number: "DC-2023/24-1052",
  vehicle_number: "TN 33 BJ 2122",
  place_of_supply: "Tamil Nadu (33)",
  
  customer_name: "Victory Mandi Ledger Agency",
  customer_address: "12, Market Main Road,\nTiruppur, Tamil Nadu 641604",
  customer_gstin: "33ABCPV1234D1Z2",
  
  items: [
    {
      description: "Per 26Kg Boiled Rice Elavarasar",
      hsn: "10063010",
      quantity: 50,
      rate: 1640.00
    }
  ],
  
  bank_name: "Canara Bank",
  account_number: "123456789012",
  ifsc: "CNRB0001234",
  authorized_signatory: "Ravichandran"
};

/**
 * Convert number to Indian Rupee Words representation
 */
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

  // Crores
  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    result += convertLessThanThousand(crore) + ' Crore ';
    remaining %= 10000000;
  }

  // Lakhs
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    result += convertLessThanThousand(lakh) + ' Lakh ';
    remaining %= 100000;
  }

  // Thousands
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    result += convertLessThanThousand(thousand) + ' Thousand ';
    remaining %= 1000;
  }

  // Hundreds & Tens
  if (remaining > 0) {
    result += convertLessThanThousand(remaining);
  }

  result = 'Indian Rupee ' + result.trim();

  if (amountDec > 0) {
    result += ' and ' + convertLessThanThousand(amountDec) + ' Paise';
  }

  return result.trim() + ' Only';
}

/**
 * Populate values, perform automatic calculations, and render the DOM
 */
function renderInvoice(data) {
  if (!data) return;

  // Company logo & header details
  const logoImg = document.getElementById('company-logo');
  if (logoImg) {
    if (data.company_logo) {
      logoImg.src = data.company_logo;
      logoImg.style.display = 'block';
    } else {
      logoImg.style.display = 'none';
    }
  }

  document.getElementById('company-name').innerText = data.company_name || '';
  document.getElementById('company-address').innerText = data.company_address || '';
  document.getElementById('company-gstin').innerText = data.company_gstin || '';
  document.getElementById('signatory-company-name').innerText = data.company_name || '';

  // Customer billing details
  document.getElementById('customer-name').innerText = data.customer_name || '';
  document.getElementById('customer-address').innerText = data.customer_address || '';
  document.getElementById('customer-gstin').innerText = data.customer_gstin || '';

  // Invoice metadata details
  document.getElementById('invoice-number').innerText = data.invoice_number || '';
  document.getElementById('invoice-date').innerText = data.invoice_date || '';
  document.getElementById('po-number').innerText = data.po_number || '';
  document.getElementById('vehicle-number').innerText = data.vehicle_number || '';
  document.getElementById('place-of-supply').innerText = data.place_of_supply || '';

  // Items table generation
  const itemsBody = document.getElementById('items-body');
  if (itemsBody) {
    itemsBody.innerHTML = ''; // Clear original placeholder items
    
    let totalQty = 0;
    let subtotal = 0;

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        const itemAmount = item.quantity * item.rate;
        totalQty += item.quantity;
        subtotal += itemAmount;

        const row = document.createElement('tr');
        row.className = 'item-row';
        row.innerHTML = `
          <td class="col-sno">${index + 1}</td>
          <td class="col-desc">${item.description}</td>
          <td class="col-hsn">${item.hsn}</td>
          <td class="col-qty">${item.quantity.toLocaleString()}</td>
          <td class="col-rate">${item.rate.toFixed(2)}</td>
          <td class="col-amount">${itemAmount.toFixed(2)}</td>
        `;
        itemsBody.appendChild(row);
      });
    }

    // Set totals and grand totals
    const grandTotal = subtotal;
    
    document.getElementById('total-quantity').innerText = totalQty.toLocaleString();
    document.getElementById('subtotal').innerText = '₹' + subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('total').innerText = '₹' + grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Amount in Words
    document.getElementById('amount-in-words').innerText = numberToIndianRupeesWords(grandTotal);
  }

  // Bank & Signature
  document.getElementById('bank-name').innerText = data.bank_name || '';
  document.getElementById('account-number').innerText = data.account_number || '';
  document.getElementById('ifsc').innerText = data.ifsc || '';
  document.getElementById('authorized-signatory').innerText = data.authorized_signatory || '';
}

// Automatically render with defaults on page load
window.addEventListener('DOMContentLoaded', () => {
  renderInvoice(defaultInvoiceData);
});
