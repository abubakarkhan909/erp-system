# Accounting model

## Chart of accounts (seeded)

| Code | Name | Type |
|------|------|------|
| 1000 | Cash on Hand | ASSET |
| 1100 | Bank Accounts | ASSET |
| 1200 | Accounts Receivable | ASSET |
| 1300 | Inventory - Gold | ASSET |
| 1400 | Input VAT Recoverable | ASSET |
| 2000 | Accounts Payable | LIABILITY |
| 2100 | Output VAT Payable | LIABILITY |
| 2200 | Customer Advances | LIABILITY |
| 3000 | Owner Capital | EQUITY |
| 4000 | Sales Revenue | REVENUE |
| 4100 | Making Charges Revenue | REVENUE |
| 5000 | Cost of Goods Sold | EXPENSE |
| 5100 | Operating Expenses | EXPENSE |

## Posting rule

Only **POSTED** documents create journal entries. Drafts do not affect GL, stock, or VAT reports.

Every journal must balance: `sum(debit) === sum(credit)` (OMR, 3 decimals).

## Examples

### Cash sale (taxable)

- Dr 1000 Cash — gross total  
- Cr 4000 Sales — net taxable  
- Cr 2100 Output VAT — VAT amount  
- Dr 5000 COGS / Cr 1300 Inventory — cost

### Credit sale

- Dr 1200 AR instead of Cash for unpaid portion

### Purchase

- Dr 1300 Inventory — net  
- Dr 1400 Input VAT — VAT  
- Cr 2000 AP or 1000/1100 — total

### Customer advance

- Dr 1000 Cash  
- Cr 2200 Customer Advances

## Fiscal periods

Months can be **CLOSED** by Accountant. Posting into a closed period is rejected.
