# Oman VAT

## Defaults

- Currency: **OMR** (3 decimal places)
- Standard VAT rate: **5%** (configurable in company settings)
- Customer ID field: Civil ID / Resident Card

## Line calculation

```
lineNet = goldValue + makingCharges + stoneCharges - lineDiscount
goldValue = netWeightGram × goldRatePerGram (snapshot at sale)
vatAmount = round(lineNet × vatRate / 100, 3)
lineTotal = lineNet + vatAmount
```

Rate and amounts are stored on each invoice line at posting time so later rate changes do not rewrite history.

## Reports

| Report | Output VAT | Input VAT |
|--------|------------|-----------|
| Monthly | Posted sales − sale returns | Posted purchases − purchase returns |
| Quarterly | Same, 3-month window | Same |
| Yearly | Calendar year | Calendar year |

Net VAT payable = Output − Input.

Export: JSON API, Excel (ExcelJS), PDF (pdf-lib).

## Filing lock

`POST /vat/lock?year=&month=` snapshots figures into `VatReturn` for audit trail.
