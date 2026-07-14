"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// vendor/shared/dist/enums.js
var require_enums = __commonJS({
  "vendor/shared/dist/enums.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DocType = exports2.JournalStatus = exports2.FiscalPeriodStatus = exports2.ChequeStatus = exports2.UtilityBillStatus = exports2.UtilityBillType = exports2.InstallmentStatus = exports2.AdvanceOrderStatus = exports2.AccountType = exports2.StockMovementType = exports2.StockMode = exports2.ProductType = exports2.GoldKarat = exports2.PaymentMethod = exports2.DocumentStatus = exports2.PermissionCode = exports2.RoleCode = exports2.DEFAULT_VAT_RATE = exports2.CURRENCY_DECIMALS = exports2.CURRENCY_CODE = void 0;
    exports2.CURRENCY_CODE = "OMR";
    exports2.CURRENCY_DECIMALS = 3;
    exports2.DEFAULT_VAT_RATE = 5;
    var RoleCode2;
    (function(RoleCode3) {
      RoleCode3["OWNER"] = "OWNER";
      RoleCode3["MANAGER"] = "MANAGER";
      RoleCode3["CASHIER"] = "CASHIER";
      RoleCode3["SALESMAN"] = "SALESMAN";
      RoleCode3["ACCOUNTANT"] = "ACCOUNTANT";
    })(RoleCode2 || (exports2.RoleCode = RoleCode2 = {}));
    var PermissionCode;
    (function(PermissionCode2) {
      PermissionCode2["CUSTOMERS_READ"] = "customers.read";
      PermissionCode2["CUSTOMERS_WRITE"] = "customers.write";
      PermissionCode2["SUPPLIERS_READ"] = "suppliers.read";
      PermissionCode2["SUPPLIERS_WRITE"] = "suppliers.write";
      PermissionCode2["PRODUCTS_READ"] = "products.read";
      PermissionCode2["PRODUCTS_WRITE"] = "products.write";
      PermissionCode2["SALES_READ"] = "sales.read";
      PermissionCode2["SALES_WRITE"] = "sales.write";
      PermissionCode2["SALES_POST"] = "sales.post";
      PermissionCode2["SALES_VOID"] = "sales.void";
      PermissionCode2["PURCHASES_READ"] = "purchases.read";
      PermissionCode2["PURCHASES_WRITE"] = "purchases.write";
      PermissionCode2["PURCHASES_POST"] = "purchases.post";
      PermissionCode2["PURCHASES_VOID"] = "purchases.void";
      PermissionCode2["INVENTORY_READ"] = "inventory.read";
      PermissionCode2["INVENTORY_WRITE"] = "inventory.write";
      PermissionCode2["CASH_READ"] = "cash.read";
      PermissionCode2["CASH_WRITE"] = "cash.write";
      PermissionCode2["CASH_CLOSE"] = "cash.close";
      PermissionCode2["BANK_READ"] = "bank.read";
      PermissionCode2["BANK_WRITE"] = "bank.write";
      PermissionCode2["EXPENSES_READ"] = "expenses.read";
      PermissionCode2["EXPENSES_WRITE"] = "expenses.write";
      PermissionCode2["VAT_READ"] = "vat.read";
      PermissionCode2["VAT_EXPORT"] = "vat.export";
      PermissionCode2["ACCOUNTING_READ"] = "accounting.read";
      PermissionCode2["ACCOUNTING_WRITE"] = "accounting.write";
      PermissionCode2["ACCOUNTING_CLOSE_PERIOD"] = "accounting.close_period";
      PermissionCode2["REPORTS_READ"] = "reports.read";
      PermissionCode2["SETTINGS_MANAGE"] = "settings.manage";
      PermissionCode2["USERS_MANAGE"] = "users.manage";
      PermissionCode2["BACKUP_CREATE"] = "backup.create";
      PermissionCode2["BACKUP_RESTORE"] = "backup.restore";
      PermissionCode2["AUDIT_READ"] = "audit.read";
    })(PermissionCode || (exports2.PermissionCode = PermissionCode = {}));
    var DocumentStatus2;
    (function(DocumentStatus3) {
      DocumentStatus3["DRAFT"] = "DRAFT";
      DocumentStatus3["POSTED"] = "POSTED";
      DocumentStatus3["VOID"] = "VOID";
    })(DocumentStatus2 || (exports2.DocumentStatus = DocumentStatus2 = {}));
    var PaymentMethod2;
    (function(PaymentMethod3) {
      PaymentMethod3["CASH"] = "CASH";
      PaymentMethod3["BANK_TRANSFER"] = "BANK_TRANSFER";
      PaymentMethod3["CARD"] = "CARD";
      PaymentMethod3["CHEQUE"] = "CHEQUE";
      PaymentMethod3["MIXED"] = "MIXED";
    })(PaymentMethod2 || (exports2.PaymentMethod = PaymentMethod2 = {}));
    var GoldKarat3;
    (function(GoldKarat4) {
      GoldKarat4["K18"] = "K18";
      GoldKarat4["K21"] = "K21";
      GoldKarat4["K22"] = "K22";
      GoldKarat4["K24"] = "K24";
    })(GoldKarat3 || (exports2.GoldKarat = GoldKarat3 = {}));
    var ProductType2;
    (function(ProductType3) {
      ProductType3["FINISHED"] = "FINISHED";
      ProductType3["RAW_GOLD"] = "RAW_GOLD";
      ProductType3["STONE"] = "STONE";
      ProductType3["SERVICE"] = "SERVICE";
      ProductType3["MAKING"] = "MAKING";
    })(ProductType2 || (exports2.ProductType = ProductType2 = {}));
    var StockMode2;
    (function(StockMode3) {
      StockMode3["PIECE"] = "PIECE";
      StockMode3["WEIGHT"] = "WEIGHT";
      StockMode3["BOTH"] = "BOTH";
    })(StockMode2 || (exports2.StockMode = StockMode2 = {}));
    var StockMovementType2;
    (function(StockMovementType3) {
      StockMovementType3["PURCHASE"] = "PURCHASE";
      StockMovementType3["SALE"] = "SALE";
      StockMovementType3["SALE_RETURN"] = "SALE_RETURN";
      StockMovementType3["PURCHASE_RETURN"] = "PURCHASE_RETURN";
      StockMovementType3["ADJUSTMENT"] = "ADJUSTMENT";
      StockMovementType3["RESERVE"] = "RESERVE";
      StockMovementType3["RELEASE"] = "RELEASE";
      StockMovementType3["DAMAGE"] = "DAMAGE";
      StockMovementType3["EXCHANGE_IN"] = "EXCHANGE_IN";
    })(StockMovementType2 || (exports2.StockMovementType = StockMovementType2 = {}));
    var AccountType2;
    (function(AccountType3) {
      AccountType3["ASSET"] = "ASSET";
      AccountType3["LIABILITY"] = "LIABILITY";
      AccountType3["EQUITY"] = "EQUITY";
      AccountType3["REVENUE"] = "REVENUE";
      AccountType3["EXPENSE"] = "EXPENSE";
    })(AccountType2 || (exports2.AccountType = AccountType2 = {}));
    var AdvanceOrderStatus2;
    (function(AdvanceOrderStatus3) {
      AdvanceOrderStatus3["PENDING"] = "PENDING";
      AdvanceOrderStatus3["READY"] = "READY";
      AdvanceOrderStatus3["DELIVERED"] = "DELIVERED";
      AdvanceOrderStatus3["CANCELLED"] = "CANCELLED";
    })(AdvanceOrderStatus2 || (exports2.AdvanceOrderStatus = AdvanceOrderStatus2 = {}));
    var InstallmentStatus2;
    (function(InstallmentStatus3) {
      InstallmentStatus3["PENDING"] = "PENDING";
      InstallmentStatus3["PAID"] = "PAID";
      InstallmentStatus3["LATE"] = "LATE";
      InstallmentStatus3["PARTIAL"] = "PARTIAL";
    })(InstallmentStatus2 || (exports2.InstallmentStatus = InstallmentStatus2 = {}));
    var UtilityBillType2;
    (function(UtilityBillType3) {
      UtilityBillType3["ELECTRIC"] = "ELECTRIC";
      UtilityBillType3["WATER"] = "WATER";
      UtilityBillType3["GAS"] = "GAS";
      UtilityBillType3["INTERNET"] = "INTERNET";
      UtilityBillType3["MOBILE"] = "MOBILE";
      UtilityBillType3["RENT"] = "RENT";
    })(UtilityBillType2 || (exports2.UtilityBillType = UtilityBillType2 = {}));
    var UtilityBillStatus2;
    (function(UtilityBillStatus3) {
      UtilityBillStatus3["PENDING"] = "PENDING";
      UtilityBillStatus3["PAID"] = "PAID";
      UtilityBillStatus3["OVERDUE"] = "OVERDUE";
    })(UtilityBillStatus2 || (exports2.UtilityBillStatus = UtilityBillStatus2 = {}));
    var ChequeStatus;
    (function(ChequeStatus2) {
      ChequeStatus2["PENDING"] = "PENDING";
      ChequeStatus2["CLEARED"] = "CLEARED";
      ChequeStatus2["BOUNCED"] = "BOUNCED";
    })(ChequeStatus || (exports2.ChequeStatus = ChequeStatus = {}));
    var FiscalPeriodStatus;
    (function(FiscalPeriodStatus2) {
      FiscalPeriodStatus2["OPEN"] = "OPEN";
      FiscalPeriodStatus2["CLOSED"] = "CLOSED";
    })(FiscalPeriodStatus || (exports2.FiscalPeriodStatus = FiscalPeriodStatus = {}));
    var JournalStatus2;
    (function(JournalStatus3) {
      JournalStatus3["POSTED"] = "POSTED";
      JournalStatus3["REVERSED"] = "REVERSED";
    })(JournalStatus2 || (exports2.JournalStatus = JournalStatus2 = {}));
    var DocType;
    (function(DocType2) {
      DocType2["SALE"] = "SALE";
      DocType2["SALE_RETURN"] = "SALE_RETURN";
      DocType2["PURCHASE"] = "PURCHASE";
      DocType2["PURCHASE_RETURN"] = "PURCHASE_RETURN";
      DocType2["ADVANCE_ORDER"] = "ADVANCE_ORDER";
      DocType2["JOURNAL"] = "JOURNAL";
      DocType2["EXPENSE"] = "EXPENSE";
      DocType2["EXCHANGE"] = "EXCHANGE";
      DocType2["PAYMENT"] = "PAYMENT";
      DocType2["CASH_SESSION"] = "CASH_SESSION";
    })(DocType || (exports2.DocType = DocType = {}));
  }
});

// vendor/shared/dist/money.js
var require_money = __commonJS({
  "vendor/shared/dist/money.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toMinorUnits = toMinorUnits;
    exports2.fromMinorUnits = fromMinorUnits;
    exports2.roundMoney = roundMoney2;
    exports2.addMoney = addMoney2;
    exports2.subMoney = subMoney2;
    exports2.mulMoney = mulMoney;
    exports2.calcVat = calcVat2;
    exports2.calcGoldLine = calcGoldLine2;
    exports2.formatOmr = formatOmr;
    var enums_1 = require_enums();
    function toMinorUnits(value, decimals = enums_1.CURRENCY_DECIMALS) {
      const str = typeof value === "number" ? value.toFixed(Math.max(decimals + 4, 8)) : value.trim();
      const negative = str.startsWith("-");
      const cleaned = negative ? str.slice(1) : str;
      const [whole, frac = ""] = cleaned.split(".");
      const fracExtended = (frac + "0".repeat(decimals + 1)).slice(0, decimals + 1);
      const main2 = fracExtended.slice(0, decimals);
      const nextDigit = Number(fracExtended[decimals] || "0");
      let minor = BigInt(whole || "0") * BigInt(10 ** decimals) + BigInt(main2 || "0");
      if (nextDigit >= 5)
        minor += 1n;
      return negative ? -minor : minor;
    }
    function fromMinorUnits(minor, decimals = enums_1.CURRENCY_DECIMALS) {
      const negative = minor < 0n;
      const abs = negative ? -minor : minor;
      const base = 10n ** BigInt(decimals);
      const whole = abs / base;
      const frac = (abs % base).toString().padStart(decimals, "0");
      return `${negative ? "-" : ""}${whole}.${frac}`;
    }
    function roundMoney2(value, decimals = enums_1.CURRENCY_DECIMALS) {
      const minor = toMinorUnits(value, decimals);
      return fromMinorUnits(minor, decimals);
    }
    function addMoney2(...values) {
      const sum = values.reduce((acc, v) => acc + toMinorUnits(v), 0n);
      return fromMinorUnits(sum);
    }
    function subMoney2(a, b) {
      return fromMinorUnits(toMinorUnits(a) - toMinorUnits(b));
    }
    function mulMoney(a, b, decimals = enums_1.CURRENCY_DECIMALS) {
      const aMinor = toMinorUnits(a, decimals);
      const bMinor = toMinorUnits(b, decimals);
      const scale = 10n ** BigInt(decimals);
      const product = aMinor * bMinor;
      const half = scale / 2n;
      const rounded = product >= 0n ? (product + half) / scale : (product - half) / scale;
      return fromMinorUnits(rounded, decimals);
    }
    function calcVat2(netAmount, vatRatePercent, decimals = enums_1.CURRENCY_DECIMALS) {
      const net = roundMoney2(netAmount, decimals);
      const rate = typeof vatRatePercent === "number" ? vatRatePercent : parseFloat(vatRatePercent);
      const vatMinor = toMinorUnits(net, decimals) * BigInt(Math.round(rate * 1e3)) / 100000n;
      const vatFromMul = mulMoney(net, (rate / 100).toFixed(6), decimals);
      const preciseVat = fromMinorUnits(toMinorUnits(net, decimals) * BigInt(Math.round(rate * 1e3)) / (100n * 1000n), decimals);
      void vatMinor;
      void vatFromMul;
      const vat = preciseVat;
      return { net, vat, gross: addMoney2(net, vat) };
    }
    function calcGoldLine2(input) {
      const goldValue = mulMoney(input.netWeightGram, input.ratePerGram);
      const making = roundMoney2(input.makingCharges ?? 0);
      const stone = roundMoney2(input.stoneCharges ?? 0);
      const discount = roundMoney2(input.lineDiscount ?? 0);
      const lineNet = subMoney2(addMoney2(goldValue, making, stone), discount);
      const { vat, gross } = calcVat2(lineNet, input.vatRatePercent);
      return { goldValue, lineNet, vatAmount: vat, lineTotal: gross };
    }
    function formatOmr(value) {
      return `${roundMoney2(value)} OMR`;
    }
  }
});

// node_modules/zod/v3/helpers/util.cjs
var require_util = __commonJS({
  "node_modules/zod/v3/helpers/util.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getParsedType = exports2.ZodParsedType = exports2.objectUtil = exports2.util = void 0;
    var util;
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (exports2.util = util = {}));
    var objectUtil;
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (exports2.objectUtil = objectUtil = {}));
    exports2.ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    var getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return exports2.ZodParsedType.undefined;
        case "string":
          return exports2.ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? exports2.ZodParsedType.nan : exports2.ZodParsedType.number;
        case "boolean":
          return exports2.ZodParsedType.boolean;
        case "function":
          return exports2.ZodParsedType.function;
        case "bigint":
          return exports2.ZodParsedType.bigint;
        case "symbol":
          return exports2.ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return exports2.ZodParsedType.array;
          }
          if (data === null) {
            return exports2.ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return exports2.ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return exports2.ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return exports2.ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return exports2.ZodParsedType.date;
          }
          return exports2.ZodParsedType.object;
        default:
          return exports2.ZodParsedType.unknown;
      }
    };
    exports2.getParsedType = getParsedType;
  }
});

// node_modules/zod/v3/ZodError.cjs
var require_ZodError = __commonJS({
  "node_modules/zod/v3/ZodError.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ZodError = exports2.quotelessJson = exports2.ZodIssueCode = void 0;
    var util_js_1 = require_util();
    exports2.ZodIssueCode = util_js_1.util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    var quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    exports2.quotelessJson = quotelessJson;
    var ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util_js_1.util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    exports2.ZodError = ZodError;
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// node_modules/zod/v3/locales/en.cjs
var require_en = __commonJS({
  "node_modules/zod/v3/locales/en.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var ZodError_js_1 = require_ZodError();
    var util_js_1 = require_util();
    var errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodError_js_1.ZodIssueCode.invalid_type:
          if (issue.received === util_js_1.ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodError_js_1.ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_js_1.util.jsonStringifyReplacer)}`;
          break;
        case ZodError_js_1.ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util_js_1.util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util_js_1.util.joinValues(issue.options)}`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util_js_1.util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util_js_1.util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodError_js_1.ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodError_js_1.ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodError_js_1.ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodError_js_1.ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodError_js_1.ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodError_js_1.ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util_js_1.util.assertNever(issue);
      }
      return { message };
    };
    exports2.default = errorMap;
  }
});

// node_modules/zod/v3/errors.cjs
var require_errors = __commonJS({
  "node_modules/zod/v3/errors.cjs"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.defaultErrorMap = void 0;
    exports2.setErrorMap = setErrorMap;
    exports2.getErrorMap = getErrorMap;
    var en_js_1 = __importDefault(require_en());
    exports2.defaultErrorMap = en_js_1.default;
    var overrideErrorMap = en_js_1.default;
    function setErrorMap(map) {
      overrideErrorMap = map;
    }
    function getErrorMap() {
      return overrideErrorMap;
    }
  }
});

// node_modules/zod/v3/helpers/parseUtil.cjs
var require_parseUtil = __commonJS({
  "node_modules/zod/v3/helpers/parseUtil.cjs"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAsync = exports2.isValid = exports2.isDirty = exports2.isAborted = exports2.OK = exports2.DIRTY = exports2.INVALID = exports2.ParseStatus = exports2.EMPTY_PATH = exports2.makeIssue = void 0;
    exports2.addIssueToContext = addIssueToContext;
    var errors_js_1 = require_errors();
    var en_js_1 = __importDefault(require_en());
    var makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    exports2.makeIssue = makeIssue;
    exports2.EMPTY_PATH = [];
    function addIssueToContext(ctx, issueData) {
      const overrideMap = (0, errors_js_1.getErrorMap)();
      const issue = (0, exports2.makeIssue)({
        issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          // contextual error map is first priority
          ctx.schemaErrorMap,
          // then schema-bound map if available
          overrideMap,
          // then global override map
          overrideMap === en_js_1.default ? void 0 : en_js_1.default
          // then global default map
        ].filter((x) => !!x)
      });
      ctx.common.issues.push(issue);
    }
    var ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return exports2.INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return exports2.INVALID;
          if (value.status === "aborted")
            return exports2.INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    exports2.ParseStatus = ParseStatus;
    exports2.INVALID = Object.freeze({
      status: "aborted"
    });
    var DIRTY = (value) => ({ status: "dirty", value });
    exports2.DIRTY = DIRTY;
    var OK = (value) => ({ status: "valid", value });
    exports2.OK = OK;
    var isAborted = (x) => x.status === "aborted";
    exports2.isAborted = isAborted;
    var isDirty = (x) => x.status === "dirty";
    exports2.isDirty = isDirty;
    var isValid = (x) => x.status === "valid";
    exports2.isValid = isValid;
    var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
    exports2.isAsync = isAsync;
  }
});

// node_modules/zod/v3/helpers/typeAliases.cjs
var require_typeAliases = __commonJS({
  "node_modules/zod/v3/helpers/typeAliases.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/zod/v3/helpers/errorUtil.cjs
var require_errorUtil = __commonJS({
  "node_modules/zod/v3/helpers/errorUtil.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.errorUtil = void 0;
    var errorUtil;
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (exports2.errorUtil = errorUtil = {}));
  }
});

// node_modules/zod/v3/types.cjs
var require_types = __commonJS({
  "node_modules/zod/v3/types.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.discriminatedUnion = exports2.date = exports2.boolean = exports2.bigint = exports2.array = exports2.any = exports2.coerce = exports2.ZodFirstPartyTypeKind = exports2.late = exports2.ZodSchema = exports2.Schema = exports2.ZodReadonly = exports2.ZodPipeline = exports2.ZodBranded = exports2.BRAND = exports2.ZodNaN = exports2.ZodCatch = exports2.ZodDefault = exports2.ZodNullable = exports2.ZodOptional = exports2.ZodTransformer = exports2.ZodEffects = exports2.ZodPromise = exports2.ZodNativeEnum = exports2.ZodEnum = exports2.ZodLiteral = exports2.ZodLazy = exports2.ZodFunction = exports2.ZodSet = exports2.ZodMap = exports2.ZodRecord = exports2.ZodTuple = exports2.ZodIntersection = exports2.ZodDiscriminatedUnion = exports2.ZodUnion = exports2.ZodObject = exports2.ZodArray = exports2.ZodVoid = exports2.ZodNever = exports2.ZodUnknown = exports2.ZodAny = exports2.ZodNull = exports2.ZodUndefined = exports2.ZodSymbol = exports2.ZodDate = exports2.ZodBoolean = exports2.ZodBigInt = exports2.ZodNumber = exports2.ZodString = exports2.ZodType = void 0;
    exports2.NEVER = exports2.void = exports2.unknown = exports2.union = exports2.undefined = exports2.tuple = exports2.transformer = exports2.symbol = exports2.string = exports2.strictObject = exports2.set = exports2.record = exports2.promise = exports2.preprocess = exports2.pipeline = exports2.ostring = exports2.optional = exports2.onumber = exports2.oboolean = exports2.object = exports2.number = exports2.nullable = exports2.null = exports2.never = exports2.nativeEnum = exports2.nan = exports2.map = exports2.literal = exports2.lazy = exports2.intersection = exports2.instanceof = exports2.function = exports2.enum = exports2.effect = void 0;
    exports2.datetimeRegex = datetimeRegex;
    exports2.custom = custom;
    var ZodError_js_1 = require_ZodError();
    var errors_js_1 = require_errors();
    var errorUtil_js_1 = require_errorUtil();
    var parseUtil_js_1 = require_parseUtil();
    var util_js_1 = require_util();
    var ParseInputLazyPath = class {
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    var handleResult = (ctx, result) => {
      if ((0, parseUtil_js_1.isValid)(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError_js_1.ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    function processCreateParams(params) {
      if (!params)
        return {};
      const { errorMap, invalid_type_error, required_error, description } = params;
      if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
      }
      if (errorMap)
        return { errorMap, description };
      const customMap = (iss, ctx) => {
        const { message } = params;
        if (iss.code === "invalid_enum_value") {
          return { message: message ?? ctx.defaultError };
        }
        if (typeof ctx.data === "undefined") {
          return { message: message ?? required_error ?? ctx.defaultError };
        }
        if (iss.code !== "invalid_type")
          return { message: ctx.defaultError };
        return { message: message ?? invalid_type_error ?? ctx.defaultError };
      };
      return { errorMap: customMap, description };
    }
    var ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return (0, util_js_1.getParsedType)(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: (0, util_js_1.getParsedType)(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new parseUtil_js_1.ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: (0, util_js_1.getParsedType)(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if ((0, parseUtil_js_1.isAsync)(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_js_1.getParsedType)(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_js_1.getParsedType)(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return (0, parseUtil_js_1.isValid)(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => (0, parseUtil_js_1.isValid)(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_js_1.getParsedType)(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await ((0, parseUtil_js_1.isAsync)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodError_js_1.ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    exports2.ZodType = ZodType;
    exports2.Schema = ZodType;
    exports2.ZodSchema = ZodType;
    var cuidRegex = /^c[^\s-]{8,}$/i;
    var cuid2Regex = /^[0-9a-z]+$/;
    var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    var nanoidRegex = /^[a-z0-9_-]{21}$/i;
    var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    var emojiRegex;
    var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    var dateRegex = new RegExp(`^${dateRegexSource}$`);
    function timeRegexSource(args) {
      let secondsRegexSource = `[0-5]\\d`;
      if (args.precision) {
        secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
      } else if (args.precision == null) {
        secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
      }
      const secondsQuantifier = args.precision ? "+" : "?";
      return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
    }
    function timeRegex(args) {
      return new RegExp(`^${timeRegexSource(args)}$`);
    }
    function datetimeRegex(args) {
      let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
      const opts = [];
      opts.push(args.local ? `Z?` : `Z`);
      if (args.offset)
        opts.push(`([+-]\\d{2}:?\\d{2})`);
      regex = `${regex}(${opts.join("|")})`;
      return new RegExp(`^${regex}$`);
    }
    function isValidIP(ip, version) {
      if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
      }
      return false;
    }
    function isValidJWT(jwt, alg) {
      if (!jwtRegex.test(jwt))
        return false;
      try {
        const [header] = jwt.split(".");
        if (!header)
          return false;
        const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
        const decoded = JSON.parse(atob(base64));
        if (typeof decoded !== "object" || decoded === null)
          return false;
        if ("typ" in decoded && decoded?.typ !== "JWT")
          return false;
        if (!decoded.alg)
          return false;
        if (alg && decoded.alg !== alg)
          return false;
        return true;
      } catch {
        return false;
      }
    }
    function isValidCidr(ip, version) {
      if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
        return true;
      }
      return false;
    }
    var ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.string,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                  code: ZodError_js_1.ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                (0, parseUtil_js_1.addIssueToContext)(ctx, {
                  code: ZodError_js_1.ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "email",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "emoji",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "uuid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "nanoid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "cuid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "cuid2",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "ulid",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "url",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "regex",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "duration",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "ip",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "jwt",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "cidr",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "base64",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                validation: "base64url",
                code: ZodError_js_1.ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodError_js_1.ZodIssueCode.invalid_string,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil_js_1.errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil_js_1.errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil_js_1.errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil_js_1.errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil_js_1.errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    exports2.ZodString = ZodString;
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    function floatSafeRemainder(val, step) {
      const valDecCount = (val.toString().split(".")[1] || "").length;
      const stepDecCount = (step.toString().split(".")[1] || "").length;
      const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
      const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
      const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
      return valInt % stepInt / 10 ** decCount;
    }
    var ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.number,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        let ctx = void 0;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util_js_1.util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_js_1.errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil_js_1.errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util_js_1.util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    exports2.ZodNumber = ZodNumber;
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    var ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new parseUtil_js_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_js_1.errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    exports2.ZodBigInt = ZodBigInt;
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    var ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports2.ZodBoolean = ZodBoolean;
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    var ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.date,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_date
          });
          return parseUtil_js_1.INVALID;
        }
        const status = new parseUtil_js_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util_js_1.util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil_js_1.errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    exports2.ZodDate = ZodDate;
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    var ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports2.ZodSymbol = ZodSymbol;
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    var ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports2.ZodUndefined = ZodUndefined;
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    var ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.null,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports2.ZodNull = ZodNull;
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    var ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports2.ZodAny = ZodAny;
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    var ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports2.ZodUnknown = ZodUnknown;
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    var ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_js_1.addIssueToContext)(ctx, {
          code: ZodError_js_1.ZodIssueCode.invalid_type,
          expected: util_js_1.ZodParsedType.never,
          received: ctx.parsedType
        });
        return parseUtil_js_1.INVALID;
      }
    };
    exports2.ZodNever = ZodNever;
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    var ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.void,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
    };
    exports2.ZodVoid = ZodVoid;
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    var ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.array,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: tooBig ? ZodError_js_1.ZodIssueCode.too_big : ZodError_js_1.ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return parseUtil_js_1.ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return parseUtil_js_1.ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    exports2.ZodArray = ZodArray;
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    function deepPartialify(schema) {
      if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
          const fieldSchema = schema.shape[key];
          newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
          ...schema._def,
          shape: () => newShape
        });
      } else if (schema instanceof ZodArray) {
        return new ZodArray({
          ...schema._def,
          type: deepPartialify(schema.element)
        });
      } else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
      } else {
        return schema;
      }
    }
    var ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util_js_1.util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx2, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.object,
            received: ctx2.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              (0, parseUtil_js_1.addIssueToContext)(ctx, {
                code: ZodError_js_1.ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return parseUtil_js_1.ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil_js_1.errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil_js_1.errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util_js_1.util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util_js_1.util.objectKeys(this.shape));
      }
    };
    exports2.ZodObject = ZodObject;
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    var ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError_js_1.ZodError(result.ctx.common.issues));
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_union,
            unionErrors
          });
          return parseUtil_js_1.INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError_js_1.ZodError(issues2));
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_union,
            unionErrors
          });
          return parseUtil_js_1.INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    exports2.ZodUnion = ZodUnion;
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    var getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util_js_1.util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.object,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return parseUtil_js_1.INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    exports2.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
    function mergeValues(a, b) {
      const aType = (0, util_js_1.getParsedType)(a);
      const bType = (0, util_js_1.getParsedType)(b);
      if (a === b) {
        return { valid: true, data: a };
      } else if (aType === util_js_1.ZodParsedType.object && bType === util_js_1.ZodParsedType.object) {
        const bKeys = util_js_1.util.objectKeys(b);
        const sharedKeys = util_js_1.util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
          const sharedValue = mergeValues(a[key], b[key]);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
      } else if (aType === util_js_1.ZodParsedType.array && bType === util_js_1.ZodParsedType.array) {
        if (a.length !== b.length) {
          return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
          const itemA = a[index];
          const itemB = b[index];
          const sharedValue = mergeValues(itemA, itemB);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
      } else if (aType === util_js_1.ZodParsedType.date && bType === util_js_1.ZodParsedType.date && +a === +b) {
        return { valid: true, data: a };
      } else {
        return { valid: false };
      }
    }
    var ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if ((0, parseUtil_js_1.isAborted)(parsedLeft) || (0, parseUtil_js_1.isAborted)(parsedRight)) {
            return parseUtil_js_1.INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.invalid_intersection_types
            });
            return parseUtil_js_1.INVALID;
          }
          if ((0, parseUtil_js_1.isDirty)(parsedLeft) || (0, parseUtil_js_1.isDirty)(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    exports2.ZodIntersection = ZodIntersection;
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    var ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.array,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return parseUtil_js_1.INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return parseUtil_js_1.ParseStatus.mergeArray(status, results);
          });
        } else {
          return parseUtil_js_1.ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    exports2.ZodTuple = ZodTuple;
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    var ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.object,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return parseUtil_js_1.ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    exports2.ZodRecord = ZodRecord;
    var ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.map) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.map,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return parseUtil_js_1.INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return parseUtil_js_1.INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    exports2.ZodMap = ZodMap;
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    var ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.set) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.set,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            (0, parseUtil_js_1.addIssueToContext)(ctx, {
              code: ZodError_js_1.ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil_js_1.errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    exports2.ZodSet = ZodSet;
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    var ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.function) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.function,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        function makeArgsIssue(args, error) {
          return (0, parseUtil_js_1.makeIssue)({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
            issueData: {
              code: ZodError_js_1.ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return (0, parseUtil_js_1.makeIssue)({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0, errors_js_1.getErrorMap)(), errors_js_1.defaultErrorMap].filter((x) => !!x),
            issueData: {
              code: ZodError_js_1.ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return (0, parseUtil_js_1.OK)(async function(...args) {
            const error = new ZodError_js_1.ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return (0, parseUtil_js_1.OK)(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError_js_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError_js_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    exports2.ZodFunction = ZodFunction;
    var ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    exports2.ZodLazy = ZodLazy;
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    var ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_js_1.ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return parseUtil_js_1.INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    exports2.ZodLiteral = ZodLiteral;
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    function createZodEnum(values, params) {
      return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params)
      });
    }
    var ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            expected: util_js_1.util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodError_js_1.ZodIssueCode.invalid_type
          });
          return parseUtil_js_1.INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    exports2.ZodEnum = ZodEnum;
    ZodEnum.create = createZodEnum;
    var ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util_js_1.util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.string && ctx.parsedType !== util_js_1.ZodParsedType.number) {
          const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            expected: util_js_1.util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodError_js_1.ZodIssueCode.invalid_type
          });
          return parseUtil_js_1.INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util_js_1.util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return parseUtil_js_1.INVALID;
        }
        return (0, parseUtil_js_1.OK)(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    exports2.ZodNativeEnum = ZodNativeEnum;
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    var ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_js_1.ZodParsedType.promise && ctx.common.async === false) {
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.promise,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        const promisified = ctx.parsedType === util_js_1.ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return (0, parseUtil_js_1.OK)(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    exports2.ZodPromise = ZodPromise;
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    var ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            (0, parseUtil_js_1.addIssueToContext)(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return parseUtil_js_1.INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return parseUtil_js_1.INVALID;
              if (result.status === "dirty")
                return (0, parseUtil_js_1.DIRTY)(result.value);
              if (status.value === "dirty")
                return (0, parseUtil_js_1.DIRTY)(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return parseUtil_js_1.INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (result.status === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            if (status.value === "dirty")
              return (0, parseUtil_js_1.DIRTY)(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return parseUtil_js_1.INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!(0, parseUtil_js_1.isValid)(base))
              return parseUtil_js_1.INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!(0, parseUtil_js_1.isValid)(base))
                return parseUtil_js_1.INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util_js_1.util.assertNever(effect);
      }
    };
    exports2.ZodEffects = ZodEffects;
    exports2.ZodTransformer = ZodEffects;
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    var ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.undefined) {
          return (0, parseUtil_js_1.OK)(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports2.ZodOptional = ZodOptional;
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    var ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_js_1.ZodParsedType.null) {
          return (0, parseUtil_js_1.OK)(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports2.ZodNullable = ZodNullable;
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    var ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === util_js_1.ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    exports2.ZodDefault = ZodDefault;
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    var ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if ((0, parseUtil_js_1.isAsync)(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError_js_1.ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError_js_1.ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    exports2.ZodCatch = ZodCatch;
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    var ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_js_1.ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_js_1.addIssueToContext)(ctx, {
            code: ZodError_js_1.ZodIssueCode.invalid_type,
            expected: util_js_1.ZodParsedType.nan,
            received: ctx.parsedType
          });
          return parseUtil_js_1.INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    exports2.ZodNaN = ZodNaN;
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    exports2.BRAND = /* @__PURE__ */ Symbol("zod_brand");
    var ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    exports2.ZodBranded = ZodBranded;
    var ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return parseUtil_js_1.INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return (0, parseUtil_js_1.DIRTY)(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return parseUtil_js_1.INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    exports2.ZodPipeline = ZodPipeline;
    var ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if ((0, parseUtil_js_1.isValid)(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return (0, parseUtil_js_1.isAsync)(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports2.ZodReadonly = ZodReadonly;
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    function cleanParams(params, data) {
      const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
      const p2 = typeof p === "string" ? { message: p } : p;
      return p2;
    }
    function custom(check, _params = {}, fatal) {
      if (check)
        return ZodAny.create().superRefine((data, ctx) => {
          const r = check(data);
          if (r instanceof Promise) {
            return r.then((r2) => {
              if (!r2) {
                const params = cleanParams(_params, data);
                const _fatal = params.fatal ?? fatal ?? true;
                ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
              }
            });
          }
          if (!r) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
          return;
        });
      return ZodAny.create();
    }
    exports2.late = {
      object: ZodObject.lazycreate
    };
    var ZodFirstPartyTypeKind;
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (exports2.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}));
    var instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    exports2.instanceof = instanceOfType;
    var stringType = ZodString.create;
    exports2.string = stringType;
    var numberType = ZodNumber.create;
    exports2.number = numberType;
    var nanType = ZodNaN.create;
    exports2.nan = nanType;
    var bigIntType = ZodBigInt.create;
    exports2.bigint = bigIntType;
    var booleanType = ZodBoolean.create;
    exports2.boolean = booleanType;
    var dateType = ZodDate.create;
    exports2.date = dateType;
    var symbolType = ZodSymbol.create;
    exports2.symbol = symbolType;
    var undefinedType = ZodUndefined.create;
    exports2.undefined = undefinedType;
    var nullType = ZodNull.create;
    exports2.null = nullType;
    var anyType = ZodAny.create;
    exports2.any = anyType;
    var unknownType = ZodUnknown.create;
    exports2.unknown = unknownType;
    var neverType = ZodNever.create;
    exports2.never = neverType;
    var voidType = ZodVoid.create;
    exports2.void = voidType;
    var arrayType = ZodArray.create;
    exports2.array = arrayType;
    var objectType = ZodObject.create;
    exports2.object = objectType;
    var strictObjectType = ZodObject.strictCreate;
    exports2.strictObject = strictObjectType;
    var unionType = ZodUnion.create;
    exports2.union = unionType;
    var discriminatedUnionType = ZodDiscriminatedUnion.create;
    exports2.discriminatedUnion = discriminatedUnionType;
    var intersectionType = ZodIntersection.create;
    exports2.intersection = intersectionType;
    var tupleType = ZodTuple.create;
    exports2.tuple = tupleType;
    var recordType = ZodRecord.create;
    exports2.record = recordType;
    var mapType = ZodMap.create;
    exports2.map = mapType;
    var setType = ZodSet.create;
    exports2.set = setType;
    var functionType = ZodFunction.create;
    exports2.function = functionType;
    var lazyType = ZodLazy.create;
    exports2.lazy = lazyType;
    var literalType = ZodLiteral.create;
    exports2.literal = literalType;
    var enumType = ZodEnum.create;
    exports2.enum = enumType;
    var nativeEnumType = ZodNativeEnum.create;
    exports2.nativeEnum = nativeEnumType;
    var promiseType = ZodPromise.create;
    exports2.promise = promiseType;
    var effectsType = ZodEffects.create;
    exports2.effect = effectsType;
    exports2.transformer = effectsType;
    var optionalType = ZodOptional.create;
    exports2.optional = optionalType;
    var nullableType = ZodNullable.create;
    exports2.nullable = nullableType;
    var preprocessType = ZodEffects.createWithPreprocess;
    exports2.preprocess = preprocessType;
    var pipelineType = ZodPipeline.create;
    exports2.pipeline = pipelineType;
    var ostring = () => stringType().optional();
    exports2.ostring = ostring;
    var onumber = () => numberType().optional();
    exports2.onumber = onumber;
    var oboolean = () => booleanType().optional();
    exports2.oboolean = oboolean;
    exports2.coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    exports2.NEVER = parseUtil_js_1.INVALID;
  }
});

// node_modules/zod/v3/external.cjs
var require_external = __commonJS({
  "node_modules/zod/v3/external.cjs"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_errors(), exports2);
    __exportStar(require_parseUtil(), exports2);
    __exportStar(require_typeAliases(), exports2);
    __exportStar(require_util(), exports2);
    __exportStar(require_types(), exports2);
    __exportStar(require_ZodError(), exports2);
  }
});

// node_modules/zod/index.cjs
var require_zod = __commonJS({
  "node_modules/zod/index.cjs"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.z = void 0;
    var z = __importStar(require_external());
    exports2.z = z;
    __exportStar(require_external(), exports2);
    exports2.default = z;
  }
});

// vendor/shared/dist/schemas.js
var require_schemas = __commonJS({
  "vendor/shared/dist/schemas.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.advanceOrderSchema = exports2.companySettingsSchema = exports2.saleInvoiceSchema = exports2.paymentRowSchema = exports2.saleItemSchema = exports2.goldRateSchema = exports2.productSchema = exports2.supplierSchema = exports2.customerSchema = exports2.changePasswordSchema = exports2.loginSchema = exports2.paginationSchema = exports2.moneySchema = void 0;
    var zod_1 = require_zod();
    var enums_1 = require_enums();
    exports2.moneySchema = zod_1.z.string().regex(/^-?\d+(\.\d{1,3})?$/, "Invalid OMR amount (max 3 decimals)");
    exports2.paginationSchema = zod_1.z.object({
      page: zod_1.z.coerce.number().int().min(1).default(1),
      pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
      search: zod_1.z.string().optional(),
      sortBy: zod_1.z.string().optional(),
      sortDir: zod_1.z.enum(["asc", "desc"]).default("desc")
    });
    exports2.loginSchema = zod_1.z.object({
      username: zod_1.z.string().min(1),
      password: zod_1.z.string().min(1)
    });
    exports2.changePasswordSchema = zod_1.z.object({
      currentPassword: zod_1.z.string().min(1),
      newPassword: zod_1.z.string().min(8)
    });
    exports2.customerSchema = zod_1.z.object({
      name: zod_1.z.string().min(1).max(200),
      phone: zod_1.z.string().max(30).optional().nullable(),
      email: zod_1.z.string().email().optional().nullable().or(zod_1.z.literal("")),
      address: zod_1.z.string().max(500).optional().nullable(),
      civilId: zod_1.z.string().max(50).optional().nullable(),
      openingBalance: exports2.moneySchema.default("0.000"),
      notes: zod_1.z.string().max(2e3).optional().nullable()
    });
    exports2.supplierSchema = zod_1.z.object({
      name: zod_1.z.string().min(1).max(200),
      phone: zod_1.z.string().max(30).optional().nullable(),
      email: zod_1.z.string().email().optional().nullable().or(zod_1.z.literal("")),
      address: zod_1.z.string().max(500).optional().nullable(),
      tradeLicense: zod_1.z.string().max(100).optional().nullable(),
      openingBalance: exports2.moneySchema.default("0.000"),
      notes: zod_1.z.string().max(2e3).optional().nullable()
    });
    exports2.productSchema = zod_1.z.object({
      sku: zod_1.z.string().min(1).max(50),
      barcode: zod_1.z.string().max(100).optional().nullable(),
      name: zod_1.z.string().min(1).max(200),
      description: zod_1.z.string().max(2e3).optional().nullable(),
      categoryId: zod_1.z.string().cuid().optional().nullable(),
      brandId: zod_1.z.string().cuid().optional().nullable(),
      productType: zod_1.z.nativeEnum(enums_1.ProductType).default(enums_1.ProductType.FINISHED),
      stockMode: zod_1.z.nativeEnum(enums_1.StockMode).default(enums_1.StockMode.BOTH),
      purityKarat: zod_1.z.nativeEnum(enums_1.GoldKarat).optional().nullable(),
      grossWeight: exports2.moneySchema.default("0.000"),
      netWeight: exports2.moneySchema.default("0.000"),
      stoneWeight: exports2.moneySchema.default("0.000"),
      makingCharges: exports2.moneySchema.default("0.000"),
      stoneCharges: exports2.moneySchema.default("0.000"),
      vatRate: exports2.moneySchema.optional().nullable(),
      purchasePrice: exports2.moneySchema.default("0.000"),
      sellingPrice: exports2.moneySchema.default("0.000"),
      minStockQty: zod_1.z.coerce.number().default(0),
      minStockWeight: exports2.moneySchema.default("0.000"),
      status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
    });
    exports2.goldRateSchema = zod_1.z.object({
      rateDate: zod_1.z.string().or(zod_1.z.coerce.date()),
      karat: zod_1.z.nativeEnum(enums_1.GoldKarat),
      ratePerGram: exports2.moneySchema
    });
    exports2.saleItemSchema = zod_1.z.object({
      productId: zod_1.z.string().cuid(),
      quantity: zod_1.z.coerce.number().positive(),
      grossWeight: exports2.moneySchema.default("0.000"),
      netWeight: exports2.moneySchema.default("0.000"),
      stoneWeight: exports2.moneySchema.default("0.000"),
      karat: zod_1.z.nativeEnum(enums_1.GoldKarat).optional().nullable(),
      goldRateSnapshot: exports2.moneySchema.default("0.000"),
      unitPrice: exports2.moneySchema.default("0.000"),
      makingCharges: exports2.moneySchema.default("0.000"),
      stoneCharges: exports2.moneySchema.default("0.000"),
      lineDiscount: exports2.moneySchema.default("0.000"),
      vatRate: exports2.moneySchema.default("5.000")
    });
    exports2.paymentRowSchema = zod_1.z.object({
      method: zod_1.z.nativeEnum(enums_1.PaymentMethod),
      amount: exports2.moneySchema,
      bankAccountId: zod_1.z.string().cuid().optional().nullable(),
      reference: zod_1.z.string().max(100).optional().nullable(),
      chequeNo: zod_1.z.string().max(50).optional().nullable(),
      chequeBankName: zod_1.z.string().max(100).optional().nullable(),
      chequeDueDate: zod_1.z.string().optional().nullable(),
      idempotencyKey: zod_1.z.string().max(100).optional().nullable()
    });
    exports2.saleInvoiceSchema = zod_1.z.object({
      customerId: zod_1.z.string().cuid().optional().nullable(),
      invoiceDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
      discount: exports2.moneySchema.default("0.000"),
      notes: zod_1.z.string().max(2e3).optional().nullable(),
      items: zod_1.z.array(exports2.saleItemSchema).min(1),
      payments: zod_1.z.array(exports2.paymentRowSchema).optional(),
      status: zod_1.z.nativeEnum(enums_1.DocumentStatus).default(enums_1.DocumentStatus.DRAFT)
    });
    exports2.companySettingsSchema = zod_1.z.object({
      name: zod_1.z.string().min(1).max(200),
      logoPath: zod_1.z.string().optional().nullable(),
      address: zod_1.z.string().max(500).optional().nullable(),
      phone: zod_1.z.string().max(50).optional().nullable(),
      email: zod_1.z.string().email().optional().nullable().or(zod_1.z.literal("")),
      crNumber: zod_1.z.string().max(50).optional().nullable(),
      vatNumber: zod_1.z.string().max(50).optional().nullable(),
      currency: zod_1.z.literal("OMR").default("OMR"),
      defaultVatRate: exports2.moneySchema.default("5.000"),
      invoicePrefix: zod_1.z.string().max(20).default("INV"),
      receiptFooter: zod_1.z.string().max(500).optional().nullable()
    });
    exports2.advanceOrderSchema = zod_1.z.object({
      customerId: zod_1.z.string().cuid(),
      expectedDelivery: zod_1.z.string().or(zod_1.z.coerce.date()).optional().nullable(),
      advancePaid: exports2.moneySchema.default("0.000"),
      totalAmount: exports2.moneySchema,
      notes: zod_1.z.string().max(2e3).optional().nullable(),
      description: zod_1.z.string().min(1).max(1e3),
      status: zod_1.z.nativeEnum(enums_1.AdvanceOrderStatus).default(enums_1.AdvanceOrderStatus.PENDING)
    });
  }
});

// vendor/shared/dist/index.js
var require_dist = __commonJS({
  "vendor/shared/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_enums(), exports2);
    __exportStar(require_money(), exports2);
    __exportStar(require_schemas(), exports2);
  }
});

// prisma/seed-demo.ts
var seed_demo_exports = {};
__export(seed_demo_exports, {
  seedDemoData: () => seedDemoData
});
function daysAgo(n) {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}
async function clearDemoData() {
  await prisma.journalLine.deleteMany({
    where: { journalEntry: { number: { startsWith: "DEMO-JE-" } } }
  });
  await prisma.journalEntry.deleteMany({ where: { number: { startsWith: "DEMO-JE-" } } });
  await prisma.installmentSchedule.deleteMany({
    where: { installmentPlan: { saleInvoice: { number: { startsWith: "DEMO-" } } } }
  });
  await prisma.installmentPlan.deleteMany({
    where: { saleInvoice: { number: { startsWith: "DEMO-" } } }
  });
  await prisma.salePayment.deleteMany({ where: { saleInvoice: { number: { startsWith: "DEMO-" } } } });
  await prisma.saleInvoiceItem.deleteMany({ where: { saleInvoice: { number: { startsWith: "DEMO-" } } } });
  await prisma.saleReturnItem.deleteMany({ where: { saleReturn: { number: { startsWith: "DEMO-" } } } });
  await prisma.saleReturn.deleteMany({ where: { number: { startsWith: "DEMO-" } } });
  await prisma.oldGoldExchange.deleteMany({ where: { number: { startsWith: "DEMO-" } } });
  await prisma.saleInvoice.deleteMany({ where: { number: { startsWith: "DEMO-" } } });
  await prisma.purchasePayment.deleteMany({
    where: { purchaseInvoice: { number: { startsWith: "DEMO-" } } }
  });
  await prisma.purchaseInvoiceItem.deleteMany({
    where: { purchaseInvoice: { number: { startsWith: "DEMO-" } } }
  });
  await prisma.purchaseReturnItem.deleteMany({
    where: { purchaseReturn: { number: { startsWith: "DEMO-" } } }
  });
  await prisma.purchaseReturn.deleteMany({ where: { number: { startsWith: "DEMO-" } } });
  await prisma.purchaseInvoice.deleteMany({ where: { number: { startsWith: "DEMO-" } } });
  await prisma.advanceOrder.deleteMany({ where: { orderNo: { startsWith: "DEMO-" } } });
  await prisma.customOrder.deleteMany({ where: { orderNo: { startsWith: "DEMO-" } } });
  await prisma.repairOrder.deleteMany({ where: { orderNo: { startsWith: "DEMO-" } } });
  await prisma.expense.deleteMany({ where: { number: { startsWith: "DEMO-" } } });
  await prisma.utilityBill.deleteMany({ where: { notes: { contains: "[DEMO]" } } });
  await prisma.cashTransaction.deleteMany({ where: { reason: { contains: "[DEMO]" } } });
  await prisma.cashSession.deleteMany({ where: { notes: { contains: "[DEMO]" } } });
  await prisma.bankTransaction.deleteMany({ where: { memo: { contains: "[DEMO]" } } });
  await prisma.notification.deleteMany({ where: { title: { contains: "[DEMO]" } } });
  await prisma.auditLog.deleteMany({ where: { entity: { startsWith: "DEMO_" } } });
  await prisma.backupJob.deleteMany({ where: { filePath: { contains: "demo" } } });
  await prisma.vatReturn.deleteMany({ where: { year: 2026, month: 6 } });
  await prisma.stockMovement.deleteMany({ where: { notes: { contains: "[DEMO]" } } });
  await prisma.stockBalance.deleteMany({
    where: { product: { sku: { startsWith: "DEMO-" } } }
  });
  await prisma.product.deleteMany({ where: { sku: { startsWith: "DEMO-" } } });
  await prisma.customer.deleteMany({ where: { notes: { contains: "[DEMO]" } } });
  await prisma.supplier.deleteMany({ where: { notes: { contains: "[DEMO]" } } });
  await prisma.bankAccount.deleteMany({ where: { name: { startsWith: "[DEMO]" } } });
  await prisma.category.deleteMany({ where: { name: { startsWith: "[DEMO]" } } });
  await prisma.brand.deleteMany({ where: { name: { startsWith: "[DEMO]" } } });
}
async function ensureUser(username, fullName, roleCode, password) {
  const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
  const hash3 = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    await prisma.userRole.deleteMany({ where: { userId: existing.id } });
    await prisma.userRole.create({ data: { userId: existing.id, roleId: role.id } });
    return existing;
  }
  return prisma.user.create({
    data: {
      username,
      fullName,
      email: `${username}@jewelry.local`,
      passwordHash: hash3,
      roles: { create: [{ roleId: role.id }] }
    }
  });
}
async function postJournal(opts) {
  const accounts = await prisma.account.findMany();
  const byCode = Object.fromEntries(accounts.map((a) => [a.code, a.id]));
  return prisma.journalEntry.create({
    data: {
      number: opts.number,
      entryDate: opts.entryDate,
      memo: opts.memo,
      sourceType: opts.sourceType,
      sourceId: opts.sourceId,
      status: import_client.JournalStatus.POSTED,
      periodId: opts.periodId,
      createdById: opts.userId,
      lines: {
        create: opts.lines.map((l) => ({
          accountId: byCode[l.code],
          debit: l.debit,
          credit: l.credit,
          narration: l.narration,
          partyType: l.partyType,
          partyId: l.partyId
        }))
      }
    }
  });
}
async function seedDemoData() {
  console.log("Seeding demo data for all modules...");
  const owner = await prisma.user.findFirst({ where: { username: "owner" } });
  if (!owner) throw new Error("Run base seed first (owner user missing)");
  const existingDemo = await prisma.customer.findFirst({ where: { notes: { contains: "[DEMO]" } } });
  if (existingDemo) {
    console.log("Clearing previous demo data...");
    await clearDemoData();
  }
  const manager = await ensureUser("manager", "Fatima Al Balushi", "MANAGER", "Manager@123");
  const cashier = await ensureUser("cashier", "Ahmed Al Lawati", "CASHIER", "Cashier@123");
  const salesman = await ensureUser("salesman", "Sara Al Hinai", "SALESMAN", "Salesman@123");
  const accountant = await ensureUser("accountant", "Yousuf Al Zaabi", "ACCOUNTANT", "Accountant@123");
  const today = daysAgo(0);
  const yesterday = daysAgo(1);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const period = await prisma.fiscalPeriod.upsert({
    where: { year_month: { year, month } },
    update: {},
    create: { year, month, status: "OPEN" }
  });
  const rateDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const rateRows = [
    { date: rateDay(yesterday), karat: "K18", rate: "22.400" },
    { date: rateDay(yesterday), karat: "K21", rate: "26.100" },
    { date: rateDay(yesterday), karat: "K22", rate: "27.300" },
    { date: rateDay(yesterday), karat: "K24", rate: "29.800" },
    { date: rateDay(today), karat: "K18", rate: "22.500" },
    { date: rateDay(today), karat: "K21", rate: "26.250" },
    { date: rateDay(today), karat: "K22", rate: "27.500" },
    { date: rateDay(today), karat: "K24", rate: "30.000" }
  ];
  for (const r of rateRows) {
    await prisma.goldRate.upsert({
      where: { rateDate_karat: { rateDate: r.date, karat: r.karat } },
      update: { ratePerGram: r.rate },
      create: {
        rateDate: r.date,
        karat: r.karat,
        ratePerGram: r.rate,
        createdById: owner.id
      }
    });
  }
  const catRings = await prisma.category.upsert({
    where: { name: "[DEMO] Rings" },
    update: {},
    create: { name: "[DEMO] Rings" }
  });
  const catNecklaces = await prisma.category.upsert({
    where: { name: "[DEMO] Necklaces" },
    update: {},
    create: { name: "[DEMO] Necklaces" }
  });
  const catBangles = await prisma.category.upsert({
    where: { name: "[DEMO] Bangles" },
    update: {},
    create: { name: "[DEMO] Bangles" }
  });
  const catEarrings = await prisma.category.upsert({
    where: { name: "[DEMO] Earrings" },
    update: {},
    create: { name: "[DEMO] Earrings" }
  });
  const brandHouse = await prisma.brand.upsert({
    where: { name: "[DEMO] Al Mas House" },
    update: {},
    create: { name: "[DEMO] Al Mas House" }
  });
  const brandImport = await prisma.brand.upsert({
    where: { name: "[DEMO] Dubai Gold" },
    update: {},
    create: { name: "[DEMO] Dubai Gold" }
  });
  const customers = await Promise.all(
    [
      {
        name: "Khalid Al Busaidi",
        phone: "+96891110001",
        civilId: "12345678",
        openingBalance: "0.000",
        currentBalance: "85.000",
        address: "Qurum, Muscat"
      },
      {
        name: "Maryam Al Riyami",
        phone: "+96891110002",
        civilId: "23456789",
        openingBalance: "0.000",
        currentBalance: "0.000",
        address: "Al Khuwair, Muscat"
      },
      {
        name: "Hassan Al Mandhari",
        phone: "+96891110003",
        civilId: "34567890",
        openingBalance: "25.000",
        currentBalance: "25.000",
        address: "Sohar"
      },
      {
        name: "Aisha Al Habsi",
        phone: "+96891110004",
        civilId: "45678901",
        openingBalance: "0.000",
        currentBalance: "210.500",
        address: "Nizwa"
      },
      {
        name: "Walk-in Customer",
        phone: "+96891110005",
        civilId: null,
        openingBalance: "0.000",
        currentBalance: "0.000",
        address: "Muscat"
      }
    ].map(
      (c) => prisma.customer.create({
        data: {
          ...c,
          email: `${c.phone.replace("+", "")}@demo.om`,
          notes: "[DEMO] Sample customer for testing ledgers & sales",
          createdById: owner.id
        }
      })
    )
  );
  const [custKhalid, custMaryam, custHassan, custAisha, custWalkin] = customers;
  const suppliers = await Promise.all(
    [
      {
        name: "Muscat Gold Wholesale",
        phone: "+96824001111",
        tradeLicense: "TL-1001",
        openingBalance: "0.000",
        currentBalance: "150.000"
      },
      {
        name: "Dubai Bullion LLC",
        phone: "+97145002222",
        tradeLicense: "TL-2002",
        openingBalance: "0.000",
        currentBalance: "0.000"
      },
      {
        name: "Sohar Refinery Supply",
        phone: "+96826803333",
        tradeLicense: "TL-3003",
        openingBalance: "50.000",
        currentBalance: "50.000"
      }
    ].map(
      (s) => prisma.supplier.create({
        data: {
          ...s,
          address: "Industrial Area",
          notes: "[DEMO] Sample supplier for purchases & payables",
          createdById: owner.id
        }
      })
    )
  );
  const [supMuscat, supDubai, supSohar] = suppliers;
  const productDefs = [
    {
      sku: "DEMO-RNG-22-001",
      barcode: "8901000000011",
      name: "22K Floral Ring",
      categoryId: catRings.id,
      brandId: brandHouse.id,
      karat: "K22",
      gross: "8.500",
      net: "8.200",
      stone: "0.300",
      making: "12.000",
      purchase: "200.000",
      selling: "250.000",
      qty: "12",
      weight: "98.400"
    },
    {
      sku: "DEMO-NCK-21-002",
      barcode: "8901000000028",
      name: "21K Chain Necklace",
      categoryId: catNecklaces.id,
      brandId: brandImport.id,
      karat: "K21",
      gross: "25.000",
      net: "24.500",
      stone: "0.500",
      making: "35.000",
      purchase: "550.000",
      selling: "680.000",
      qty: "5",
      weight: "122.500"
    },
    {
      sku: "DEMO-BNG-22-003",
      barcode: "8901000000035",
      name: "22K Bangle Set",
      categoryId: catBangles.id,
      brandId: brandHouse.id,
      karat: "K22",
      gross: "40.000",
      net: "39.200",
      stone: "0.800",
      making: "45.000",
      purchase: "900.000",
      selling: "1100.000",
      qty: "3",
      weight: "117.600"
    },
    {
      sku: "DEMO-EAR-18-004",
      barcode: "8901000000042",
      name: "18K Pearl Earrings",
      categoryId: catEarrings.id,
      brandId: brandImport.id,
      karat: "K18",
      gross: "6.000",
      net: "5.200",
      stone: "0.800",
      making: "18.000",
      purchase: "140.000",
      selling: "190.000",
      qty: "20",
      weight: "104.000"
    },
    {
      sku: "DEMO-RNG-24-005",
      barcode: "8901000000059",
      name: "24K Plain Band",
      categoryId: catRings.id,
      brandId: brandHouse.id,
      karat: "K24",
      gross: "10.000",
      net: "10.000",
      stone: "0.000",
      making: "5.000",
      purchase: "280.000",
      selling: "320.000",
      qty: "2",
      weight: "20.000"
    },
    {
      sku: "DEMO-SCRAP-22",
      barcode: "8901000000066",
      name: "22K Scrap / Old Gold",
      categoryId: catRings.id,
      brandId: brandHouse.id,
      karat: "K22",
      gross: "0.000",
      net: "0.000",
      stone: "0.000",
      making: "0.000",
      purchase: "0.000",
      selling: "0.000",
      qty: "0",
      weight: "15.500"
    }
  ];
  const products = [];
  for (const p of productDefs) {
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        description: "[DEMO] Sample jewelry product",
        categoryId: p.categoryId,
        brandId: p.brandId,
        productType: p.sku.includes("SCRAP") ? import_client.ProductType.RAW_GOLD : import_client.ProductType.FINISHED,
        stockMode: import_client.StockMode.BOTH,
        purityKarat: p.karat,
        grossWeight: p.gross,
        netWeight: p.net,
        stoneWeight: p.stone,
        makingCharges: p.making,
        stoneCharges: "0.000",
        vatRate: "5.000",
        purchasePrice: p.purchase,
        sellingPrice: p.selling,
        minStockQty: "2",
        minStockWeight: "10.000",
        status: "ACTIVE",
        createdById: owner.id,
        stockBalance: {
          create: {
            onHandQty: p.qty,
            onHandWeight: p.weight,
            reservedQty: p.sku === "DEMO-NCK-21-002" ? "1" : "0",
            reservedWeight: p.sku === "DEMO-NCK-21-002" ? "24.500" : "0.000"
          }
        }
      }
    });
    products.push(product);
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: import_client.StockMovementType.PURCHASE,
        qty: p.qty,
        weight: p.weight,
        refType: "DEMO_OPENING",
        refId: "opening",
        notes: "[DEMO] Opening stock",
        createdById: owner.id
      }
    });
  }
  const [ring22, necklace21, bangle22, earrings18, band24, scrap22] = products;
  const bankNbo = await prisma.bankAccount.create({
    data: {
      name: "[DEMO] NBO Current",
      bankName: "National Bank of Oman",
      accountNo: "100200300",
      iban: "OM12NBOB000000100200300",
      openingBalance: "5000.000",
      currentBalance: "5320.000",
      isActive: true
    }
  });
  const bankMuscat = await prisma.bankAccount.create({
    data: {
      name: "[DEMO] Bank Muscat Savings",
      bankName: "Bank Muscat",
      accountNo: "99887766",
      iban: "OM45BMUS00000099887766",
      openingBalance: "2000.000",
      currentBalance: "1850.000",
      isActive: true
    }
  });
  await prisma.bankTransaction.createMany({
    data: [
      {
        bankAccountId: bankNbo.id,
        type: import_client.BankTxnType.DEPOSIT,
        amount: "500.000",
        reference: "DEMO-DEP-001",
        memo: "[DEMO] Customer card settlement",
        txnDate: yesterday,
        createdById: cashier.id
      },
      {
        bankAccountId: bankMuscat.id,
        type: import_client.BankTxnType.WITHDRAW,
        amount: "150.000",
        reference: "DEMO-WD-001",
        memo: "[DEMO] Cash for till",
        txnDate: yesterday,
        createdById: manager.id
      },
      {
        bankAccountId: bankNbo.id,
        type: import_client.BankTxnType.TRANSFER,
        amount: "200.000",
        contraAccountId: bankMuscat.id,
        reference: "DEMO-TR-001",
        memo: "[DEMO] Internal transfer",
        txnDate: today,
        createdById: accountant.id
      }
    ]
  });
  const cashSession = await prisma.cashSession.create({
    data: {
      sessionDate: today,
      openingCash: "200.000",
      status: import_client.CashSessionStatus.OPEN,
      openedById: cashier.id,
      notes: "[DEMO] Today open till",
      transactions: {
        create: [
          {
            type: "IN",
            amount: "321.300",
            reason: "[DEMO] Cash sale DEMO-INV-0001",
            createdById: cashier.id
          },
          {
            type: "OUT",
            amount: "15.000",
            reason: "[DEMO] Tea / petty cash",
            createdById: cashier.id
          }
        ]
      }
    }
  });
  const purchLine = (0, import_shared.calcGoldLine)({
    netWeightGram: "50.000",
    ratePerGram: "25.000",
    makingCharges: "0.000",
    stoneCharges: "0.000",
    lineDiscount: "0.000",
    vatRatePercent: 5
  });
  const purchNet = "1250.000";
  const purchVat = (0, import_shared.calcVat)(purchNet, 5);
  const purchase = await prisma.purchaseInvoice.create({
    data: {
      number: "DEMO-PUR-0001",
      supplierId: supMuscat.id,
      invoiceDate: daysAgo(3),
      status: import_client.DocumentStatus.POSTED,
      subtotal: purchNet,
      discount: "0.000",
      taxable: purchVat.net,
      vatAmount: purchVat.vat,
      total: purchVat.gross,
      paid: "1162.500",
      balance: "150.000",
      notes: "[DEMO] Opening gold lot purchase",
      postedAt: daysAgo(3),
      createdById: manager.id,
      items: {
        create: [
          {
            productId: ring22.id,
            quantity: "10",
            grossWeight: "52.000",
            netWeight: "50.000",
            karat: "K22",
            unitCost: "25.000",
            lineDiscount: "0.000",
            lineNet: purchVat.net,
            vatRate: "5.000",
            vatAmount: purchVat.vat,
            lineTotal: purchVat.gross
          }
        ]
      },
      payments: {
        create: [
          {
            method: import_client.PaymentMethod.BANK_TRANSFER,
            amount: "1162.500",
            bankAccountId: bankNbo.id,
            reference: "DEMO-PAY-SUP-001",
            createdById: accountant.id
          }
        ]
      }
    }
  });
  await postJournal({
    number: "DEMO-JE-PUR-0001",
    entryDate: daysAgo(3),
    memo: "Demo purchase DEMO-PUR-0001",
    sourceType: "PURCHASE",
    sourceId: purchase.id,
    userId: accountant.id,
    periodId: period.id,
    lines: [
      { code: "1300", debit: purchVat.net, credit: "0.000", narration: "Inventory" },
      { code: "1400", debit: purchVat.vat, credit: "0.000", narration: "Input VAT" },
      { code: "1100", debit: "0.000", credit: "1162.500", narration: "Bank paid" },
      {
        code: "2000",
        debit: "0.000",
        credit: "150.000",
        narration: "AP remaining",
        partyType: "SUPPLIER",
        partyId: supMuscat.id
      }
    ]
  });
  await prisma.purchaseInvoice.create({
    data: {
      number: "DEMO-PUR-0002",
      supplierId: supDubai.id,
      invoiceDate: today,
      status: import_client.DocumentStatus.DRAFT,
      subtotal: "500.000",
      taxable: "500.000",
      vatAmount: "25.000",
      total: "525.000",
      paid: "0.000",
      balance: "525.000",
      notes: "[DEMO] Draft purchase \u2014 post from Purchases screen",
      createdById: manager.id,
      items: {
        create: [
          {
            productId: necklace21.id,
            quantity: "2",
            netWeight: "49.000",
            karat: "K21",
            unitCost: "10.204",
            lineNet: "500.000",
            vatRate: "5.000",
            vatAmount: "25.000",
            lineTotal: "525.000"
          }
        ]
      }
    }
  });
  const sale1Line = (0, import_shared.calcGoldLine)({
    netWeightGram: "8.200",
    ratePerGram: "27.500",
    makingCharges: "12.000",
    stoneCharges: "0.000",
    lineDiscount: "0.000",
    vatRatePercent: 5
  });
  const sale1 = await prisma.saleInvoice.create({
    data: {
      number: "DEMO-INV-0001",
      customerId: custMaryam.id,
      invoiceDate: today,
      status: import_client.DocumentStatus.POSTED,
      subtotal: sale1Line.lineNet,
      discount: "0.000",
      taxable: sale1Line.lineNet,
      vatAmount: sale1Line.vatAmount,
      total: sale1Line.lineTotal,
      paid: sale1Line.lineTotal,
      balance: "0.000",
      notes: "[DEMO] Full cash sale \u2014 see Payments + Cash + VAT",
      postedAt: today,
      createdById: cashier.id,
      items: {
        create: [
          {
            productId: ring22.id,
            quantity: "1",
            grossWeight: "8.500",
            netWeight: "8.200",
            stoneWeight: "0.300",
            karat: "K22",
            goldRateSnapshot: "27.500",
            makingCharges: "12.000",
            stoneCharges: "0.000",
            lineDiscount: "0.000",
            lineNet: sale1Line.lineNet,
            vatRate: "5.000",
            vatAmount: sale1Line.vatAmount,
            lineTotal: sale1Line.lineTotal
          }
        ]
      },
      payments: {
        create: [
          {
            method: import_client.PaymentMethod.CASH,
            amount: sale1Line.lineTotal,
            reference: "DEMO-CASH-001",
            createdById: cashier.id
          }
        ]
      }
    }
  });
  await prisma.stockBalance.update({
    where: { productId: ring22.id },
    data: {
      onHandQty: { decrement: 1 },
      onHandWeight: { decrement: 8.2 }
    }
  });
  await prisma.stockMovement.create({
    data: {
      productId: ring22.id,
      type: import_client.StockMovementType.SALE,
      qty: "-1",
      weight: "-8.200",
      refType: "SALE",
      refId: sale1.id,
      notes: "[DEMO] Sold on DEMO-INV-0001",
      createdById: cashier.id
    }
  });
  await postJournal({
    number: "DEMO-JE-SAL-0001",
    entryDate: today,
    memo: "Demo cash sale DEMO-INV-0001",
    sourceType: "SALE",
    sourceId: sale1.id,
    userId: cashier.id,
    periodId: period.id,
    lines: [
      { code: "1000", debit: sale1Line.lineTotal, credit: "0.000" },
      { code: "4000", debit: "0.000", credit: sale1Line.lineNet },
      { code: "2100", debit: "0.000", credit: sale1Line.vatAmount },
      { code: "5000", debit: "200.000", credit: "0.000" },
      { code: "1300", debit: "0.000", credit: "200.000" }
    ]
  });
  const sale2Line = (0, import_shared.calcGoldLine)({
    netWeightGram: "24.500",
    ratePerGram: "26.250",
    makingCharges: "35.000",
    stoneCharges: "5.000",
    lineDiscount: "10.000",
    vatRatePercent: 5
  });
  const sale2Paid = "600.000";
  const sale2Balance = (0, import_shared.subMoney)(sale2Line.lineTotal, sale2Paid);
  const sale2 = await prisma.saleInvoice.create({
    data: {
      number: "DEMO-INV-0002",
      customerId: custKhalid.id,
      invoiceDate: yesterday,
      status: import_client.DocumentStatus.POSTED,
      subtotal: (0, import_shared.addMoney)(sale2Line.goldValue, "35.000", "5.000"),
      discount: "10.000",
      taxable: sale2Line.lineNet,
      vatAmount: sale2Line.vatAmount,
      total: sale2Line.lineTotal,
      paid: sale2Paid,
      balance: sale2Balance,
      notes: "[DEMO] Partial payment \u2014 remaining on customer ledger",
      postedAt: yesterday,
      createdById: salesman.id,
      items: {
        create: [
          {
            productId: necklace21.id,
            quantity: "1",
            grossWeight: "25.000",
            netWeight: "24.500",
            stoneWeight: "0.500",
            karat: "K21",
            goldRateSnapshot: "26.250",
            makingCharges: "35.000",
            stoneCharges: "5.000",
            lineDiscount: "10.000",
            lineNet: sale2Line.lineNet,
            vatRate: "5.000",
            vatAmount: sale2Line.vatAmount,
            lineTotal: sale2Line.lineTotal
          }
        ]
      },
      payments: {
        create: [
          {
            method: import_client.PaymentMethod.CARD,
            amount: "400.000",
            bankAccountId: bankNbo.id,
            reference: "OMANNET-9988",
            createdById: cashier.id
          },
          {
            method: import_client.PaymentMethod.CASH,
            amount: "200.000",
            reference: "DEMO-CASH-002",
            createdById: cashier.id
          }
        ]
      }
    }
  });
  await postJournal({
    number: "DEMO-JE-SAL-0002",
    entryDate: yesterday,
    memo: "Demo credit/partial sale DEMO-INV-0002",
    sourceType: "SALE",
    sourceId: sale2.id,
    userId: salesman.id,
    periodId: period.id,
    lines: [
      { code: "1100", debit: "400.000", credit: "0.000" },
      { code: "1000", debit: "200.000", credit: "0.000" },
      {
        code: "1200",
        debit: sale2Balance,
        credit: "0.000",
        partyType: "CUSTOMER",
        partyId: custKhalid.id
      },
      { code: "4000", debit: "0.000", credit: sale2Line.lineNet },
      { code: "2100", debit: "0.000", credit: sale2Line.vatAmount }
    ]
  });
  const sale3Total = "420.000";
  const sale3Vat = (0, import_shared.calcVat)("400.000", 5);
  const sale3 = await prisma.saleInvoice.create({
    data: {
      number: "DEMO-INV-0003",
      customerId: custAisha.id,
      invoiceDate: daysAgo(10),
      status: import_client.DocumentStatus.POSTED,
      subtotal: "400.000",
      taxable: "400.000",
      vatAmount: "20.000",
      total: sale3Total,
      paid: "105.000",
      balance: "315.000",
      notes: "[DEMO] Sold on installment plan \u2014 open Installments module",
      postedAt: daysAgo(10),
      createdById: manager.id,
      items: {
        create: [
          {
            productId: earrings18.id,
            quantity: "2",
            netWeight: "10.400",
            karat: "K18",
            goldRateSnapshot: "22.500",
            makingCharges: "36.000",
            lineNet: "400.000",
            vatRate: "5.000",
            vatAmount: "20.000",
            lineTotal: "420.000"
          }
        ]
      },
      payments: {
        create: [
          {
            method: import_client.PaymentMethod.CASH,
            amount: "105.000",
            reference: "ADVANCE-INST",
            createdById: cashier.id
          }
        ]
      }
    }
  });
  const instPlan = await prisma.installmentPlan.create({
    data: {
      saleInvoiceId: sale3.id,
      totalAmount: sale3Total,
      advanceAmount: "105.000",
      remainingAmount: "315.000",
      installmentAmount: "105.000",
      installmentCount: 3,
      createdById: manager.id,
      schedules: {
        create: [
          {
            dueDate: daysAgo(5),
            amount: "105.000",
            paidAmount: "105.000",
            status: import_client.InstallmentStatus.PAID,
            paidAt: daysAgo(4)
          },
          {
            dueDate: daysFromNow(5),
            amount: "105.000",
            paidAmount: "0.000",
            status: import_client.InstallmentStatus.PENDING
          },
          {
            dueDate: daysFromNow(35),
            amount: "105.000",
            paidAmount: "0.000",
            status: import_client.InstallmentStatus.PENDING
          }
        ]
      }
    }
  });
  void instPlan;
  void sale3Vat;
  await prisma.saleInvoice.create({
    data: {
      number: "DEMO-INV-0004",
      customerId: custWalkin.id,
      invoiceDate: today,
      status: import_client.DocumentStatus.DRAFT,
      subtotal: "100.000",
      taxable: "100.000",
      vatAmount: "5.000",
      total: "105.000",
      paid: "0.000",
      balance: "105.000",
      notes: "[DEMO] Draft invoice \u2014 edit & post from Sales",
      createdById: salesman.id,
      items: {
        create: [
          {
            productId: band24.id,
            quantity: "1",
            netWeight: "10.000",
            karat: "K24",
            goldRateSnapshot: "30.000",
            makingCharges: "5.000",
            lineNet: "100.000",
            vatRate: "5.000",
            vatAmount: "5.000",
            lineTotal: "105.000"
          }
        ]
      }
    }
  });
  const saleReturn = await prisma.saleReturn.create({
    data: {
      number: "DEMO-SR-0001",
      saleInvoiceId: sale1.id,
      customerId: custMaryam.id,
      returnDate: today,
      status: import_client.DocumentStatus.POSTED,
      taxable: "50.000",
      vatAmount: "2.500",
      total: "52.500",
      refundAmount: "52.500",
      notes: "[DEMO] Partial return / refund example",
      postedAt: today,
      createdById: manager.id,
      items: {
        create: [
          {
            productId: ring22.id,
            quantity: "0.5",
            netWeight: "1.000",
            lineNet: "50.000",
            vatRate: "5.000",
            vatAmount: "2.500",
            lineTotal: "52.500"
          }
        ]
      }
    }
  });
  await postJournal({
    number: "DEMO-JE-SR-0001",
    entryDate: today,
    memo: "Demo sale return DEMO-SR-0001",
    sourceType: "SALE_RETURN",
    sourceId: saleReturn.id,
    userId: manager.id,
    periodId: period.id,
    lines: [
      { code: "4000", debit: "50.000", credit: "0.000" },
      { code: "2100", debit: "2.500", credit: "0.000" },
      { code: "1000", debit: "0.000", credit: "52.500" }
    ]
  });
  await prisma.purchaseReturn.create({
    data: {
      number: "DEMO-PR-0001",
      purchaseInvoiceId: purchase.id,
      supplierId: supMuscat.id,
      returnDate: today,
      status: import_client.DocumentStatus.DRAFT,
      taxable: "100.000",
      vatAmount: "5.000",
      total: "105.000",
      refundAmount: "0.000",
      notes: "[DEMO] Draft purchase return",
      createdById: manager.id,
      items: {
        create: [
          {
            productId: ring22.id,
            quantity: "1",
            netWeight: "4.000",
            lineNet: "100.000",
            vatRate: "5.000",
            vatAmount: "5.000",
            lineTotal: "105.000"
          }
        ]
      }
    }
  });
  await prisma.oldGoldExchange.create({
    data: {
      number: "DEMO-EX-0001",
      customerId: custHassan.id,
      saleInvoiceId: sale2.id,
      exchangeDate: yesterday,
      karat: "K22",
      weight: "12.000",
      ratePerGram: "26.000",
      value: "312.000",
      paymentOut: "0.000",
      status: import_client.DocumentStatus.POSTED,
      notes: "[DEMO] Old gold exchanged against sale DEMO-INV-0002",
      postedAt: yesterday,
      createdById: cashier.id
    }
  });
  await prisma.stockBalance.update({
    where: { productId: scrap22.id },
    data: { onHandWeight: { increment: 12 } }
  });
  await prisma.stockMovement.create({
    data: {
      productId: scrap22.id,
      type: import_client.StockMovementType.EXCHANGE_IN,
      qty: "0",
      weight: "12.000",
      refType: "EXCHANGE",
      refId: "DEMO-EX-0001",
      notes: "[DEMO] Old gold intake",
      createdById: cashier.id
    }
  });
  await prisma.advanceOrder.create({
    data: {
      orderNo: "DEMO-ADV-0001",
      customerId: custMaryam.id,
      description: "[DEMO] Custom 22K set \u2014 advance order",
      expectedDelivery: daysFromNow(14),
      totalAmount: "800.000",
      advancePaid: "200.000",
      remaining: "600.000",
      status: import_client.AdvanceOrderStatus.PENDING,
      notes: "[DEMO] Track status Pending \u2192 Ready \u2192 Delivered",
      createdById: salesman.id
    }
  });
  await prisma.advanceOrder.create({
    data: {
      orderNo: "DEMO-ADV-0002",
      customerId: custKhalid.id,
      description: "[DEMO] Ready for pickup \u2014 bridal set",
      expectedDelivery: daysFromNow(2),
      totalAmount: "1500.000",
      advancePaid: "1500.000",
      remaining: "0.000",
      status: import_client.AdvanceOrderStatus.READY,
      notes: "[DEMO] Fully paid advance, ready status",
      createdById: manager.id
    }
  });
  await prisma.customOrder.create({
    data: {
      orderNo: "DEMO-CO-0001",
      customerId: custAisha.id,
      specs: "[DEMO] Custom name pendant, Arabic calligraphy, 21K",
      karat: "K21",
      estimatedWeight: "15.000",
      estimatedAmount: "450.000",
      advancePaid: "100.000",
      expectedDelivery: daysFromNow(20),
      status: import_client.AdvanceOrderStatus.PENDING,
      createdById: salesman.id
    }
  });
  await prisma.repairOrder.create({
    data: {
      orderNo: "DEMO-RP-0001",
      customerId: custHassan.id,
      description: "[DEMO] Resize ring + polish",
      estimatedAmount: "15.000",
      advancePaid: "5.000",
      expectedDelivery: daysFromNow(3),
      status: import_client.AdvanceOrderStatus.PENDING,
      createdById: cashier.id
    }
  });
  const expCat = await prisma.expenseCategory.findMany();
  const catByCode = Object.fromEntries(expCat.map((c) => [c.code, c.id]));
  await prisma.expense.createMany({
    data: [
      {
        number: "DEMO-EXP-0001",
        expenseDate: daysAgo(2),
        categoryId: catByCode.ELECTRIC,
        amount: "45.500",
        paymentMethod: import_client.PaymentMethod.BANK_TRANSFER,
        bankAccountId: bankNbo.id,
        reference: "ELEC-JUL",
        notes: "[DEMO] Shop electricity",
        createdById: accountant.id
      },
      {
        number: "DEMO-EXP-0002",
        expenseDate: daysAgo(1),
        categoryId: catByCode.SALARY,
        amount: "350.000",
        paymentMethod: import_client.PaymentMethod.BANK_TRANSFER,
        bankAccountId: bankNbo.id,
        reference: "SAL-JUL",
        notes: "[DEMO] Staff salary advance",
        createdById: accountant.id
      },
      {
        number: "DEMO-EXP-0003",
        expenseDate: today,
        categoryId: catByCode.TEA,
        amount: "3.250",
        paymentMethod: import_client.PaymentMethod.CASH,
        reference: "PETTY",
        notes: "[DEMO] Tea / hospitality",
        createdById: cashier.id
      },
      {
        number: "DEMO-EXP-0004",
        expenseDate: today,
        categoryId: catByCode.MARKETING,
        amount: "25.000",
        paymentMethod: import_client.PaymentMethod.CARD,
        bankAccountId: bankMuscat.id,
        reference: "ADS",
        notes: "[DEMO] Instagram ads",
        createdById: manager.id
      }
    ]
  });
  await postJournal({
    number: "DEMO-JE-EXP-0001",
    entryDate: daysAgo(2),
    memo: "Demo expense electricity",
    sourceType: "EXPENSE",
    sourceId: "DEMO-EXP-0001",
    userId: accountant.id,
    periodId: period.id,
    lines: [
      { code: "5100", debit: "45.500", credit: "0.000" },
      { code: "1100", debit: "0.000", credit: "45.500" }
    ]
  });
  await prisma.utilityBill.createMany({
    data: [
      {
        type: import_client.UtilityBillType.ELECTRIC,
        billNumber: "DEMO-ELEC-7788",
        dueDate: daysFromNow(7),
        amount: "48.000",
        status: import_client.UtilityBillStatus.PENDING,
        notes: "[DEMO] Upcoming electric bill"
      },
      {
        type: import_client.UtilityBillType.WATER,
        billNumber: "DEMO-WATER-112",
        dueDate: daysAgo(2),
        amount: "12.500",
        status: import_client.UtilityBillStatus.OVERDUE,
        notes: "[DEMO] Overdue water bill"
      },
      {
        type: import_client.UtilityBillType.INTERNET,
        billNumber: "DEMO-NET-55",
        dueDate: daysAgo(1),
        paidDate: today,
        amount: "20.000",
        status: import_client.UtilityBillStatus.PAID,
        notes: "[DEMO] Paid internet"
      },
      {
        type: import_client.UtilityBillType.RENT,
        billNumber: "DEMO-RENT-JUL",
        dueDate: daysFromNow(3),
        amount: "400.000",
        status: import_client.UtilityBillStatus.PENDING,
        notes: "[DEMO] Shop rent due soon"
      }
    ]
  });
  await prisma.vatReturn.upsert({
    where: { year_month: { year: 2026, month: 6 } },
    update: {},
    create: {
      year: 2026,
      month: 6,
      outputVat: "120.500",
      inputVat: "80.250",
      netVat: "40.250",
      taxableSales: "2410.000",
      taxablePurchases: "1605.000",
      lockedAt: daysAgo(20)
    }
  });
  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        type: "LOW_STOCK",
        title: "[DEMO] Low stock: 24K Plain Band",
        body: "Only 2 pcs left \u2014 below preferred display stock.",
        refType: "PRODUCT",
        refId: band24.id
      },
      {
        userId: owner.id,
        type: "INSTALLMENT",
        title: "[DEMO] Upcoming installment",
        body: "Aisha Al Habsi installment due in 5 days (105.000 OMR).",
        refType: "INSTALLMENT",
        refId: sale3.id
      },
      {
        userId: accountant.id,
        type: "UTILITY",
        title: "[DEMO] Overdue water bill",
        body: "Water bill DEMO-WATER-112 is overdue (12.500 OMR).",
        refType: "UTILITY_BILL"
      },
      {
        userId: owner.id,
        type: "BACKUP",
        title: "[DEMO] Backup reminder",
        body: "Create a manual backup from Backup module this week.",
        refType: "BACKUP"
      },
      {
        userId: manager.id,
        type: "PAYMENT",
        title: "[DEMO] Pending supplier payment",
        body: "Muscat Gold Wholesale balance 150.000 OMR.",
        refType: "SUPPLIER",
        refId: supMuscat.id
      }
    ]
  });
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: owner.id,
        action: "SEED",
        entity: "DEMO_SYSTEM",
        entityId: "seed",
        newValues: { message: "Demo dataset loaded" }
      },
      {
        actorId: cashier.id,
        action: "CREATE",
        entity: "DEMO_SALE",
        entityId: sale1.id,
        newValues: { number: "DEMO-INV-0001", total: sale1Line.lineTotal }
      },
      {
        actorId: manager.id,
        action: "POST",
        entity: "DEMO_PURCHASE",
        entityId: purchase.id,
        newValues: { number: "DEMO-PUR-0001" }
      }
    ]
  });
  await prisma.backupJob.create({
    data: {
      type: "MANUAL",
      status: "COMPLETED",
      filePath: "./data/backups/demo-backup-sample.json",
      sizeBytes: 20480,
      createdById: owner.id
    }
  });
  const y = year;
  for (const row of [
    { docType: "SALE", prefix: "INV", nextValue: 5 },
    { docType: "PURCHASE", prefix: "PUR", nextValue: 3 },
    { docType: "SALE_RETURN", prefix: "SR", nextValue: 2 },
    { docType: "JOURNAL", prefix: "JE", nextValue: 10 },
    { docType: "EXPENSE", prefix: "EXP", nextValue: 5 },
    { docType: "ADVANCE_ORDER", prefix: "ADV", nextValue: 3 }
  ]) {
    await prisma.numberSeries.upsert({
      where: { docType_year: { docType: row.docType, year: y } },
      update: { nextValue: row.nextValue, prefix: row.prefix },
      create: { ...row, year: y }
    });
  }
  await prisma.stockMovement.create({
    data: {
      productId: band24.id,
      type: import_client.StockMovementType.DAMAGE,
      qty: "-0.000",
      weight: "-0.500",
      notes: "[DEMO] Damaged sample piece weight write-off",
      createdById: manager.id
    }
  });
  console.log("");
  console.log("========== DEMO LOGIN ACCOUNTS ==========");
  console.log("owner      / Owner@12345     (Owner)");
  console.log("manager    / Manager@123     (Manager)");
  console.log("cashier    / Cashier@123     (Cashier)");
  console.log("salesman   / Salesman@123    (Salesman)");
  console.log("accountant / Accountant@123  (Accountant)");
  console.log("");
  console.log("========== WHERE TO LOOK IN UI ==========");
  console.log("Dashboard     \u2192 today sales/expenses totals");
  console.log("Customers     \u2192 5 demo customers (notes contain [DEMO])");
  console.log("Suppliers     \u2192 3 demo suppliers");
  console.log("Products      \u2192 SKUs starting DEMO-");
  console.log("Gold Rates    \u2192 today + yesterday for 18/21/22/24K");
  console.log("Sales         \u2192 DEMO-INV-0001..0004 (posted/draft/installment)");
  console.log("Purchases     \u2192 DEMO-PUR-0001 posted, 0002 draft");
  console.log("Inventory     \u2192 stock balances + movements");
  console.log("Cash / Banks  \u2192 open till + NBO / Bank Muscat");
  console.log("Expenses      \u2192 DEMO-EXP-0001..0004");
  console.log("VAT           \u2192 posted output/input + June 2026 lock sample");
  console.log("Accounting    \u2192 DEMO-JE-* journals, COA, trial balance");
  console.log("Advances      \u2192 DEMO-ADV / custom / repair orders");
  console.log("Installments  \u2192 plan on DEMO-INV-0003");
  console.log("Notifications \u2192 low stock, bills, backup reminders");
  console.log("Audit / Backup\u2192 sample rows");
  console.log("=========================================");
  console.log("Demo data seed complete.");
  void cashSession;
  void purchLine;
  void bangle22;
  void import_shared.roundMoney;
}
var import_client, bcrypt, import_shared, prisma;
var init_seed_demo = __esm({
  "prisma/seed-demo.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    bcrypt = __toESM(require("bcrypt"));
    import_shared = __toESM(require_dist());
    prisma = new import_client.PrismaClient();
    if (require.main === module) {
      seedDemoData().catch((e) => {
        console.error(e);
        process.exit(1);
      }).finally(async () => {
        await prisma.$disconnect();
      });
    }
  }
});

// prisma/seed.ts
var import_client2 = require("@prisma/client");
var bcrypt2 = __toESM(require("bcrypt"));
var prisma2 = new import_client2.PrismaClient();
var PERMISSIONS = [
  { code: "customers.read", name: "View customers" },
  { code: "customers.write", name: "Manage customers" },
  { code: "suppliers.read", name: "View suppliers" },
  { code: "suppliers.write", name: "Manage suppliers" },
  { code: "products.read", name: "View products" },
  { code: "products.write", name: "Manage products" },
  { code: "sales.read", name: "View sales" },
  { code: "sales.write", name: "Create/edit sales" },
  { code: "sales.post", name: "Post sales" },
  { code: "sales.void", name: "Void sales" },
  { code: "purchases.read", name: "View purchases" },
  { code: "purchases.write", name: "Manage purchases" },
  { code: "purchases.post", name: "Post purchases" },
  { code: "purchases.void", name: "Void purchases" },
  { code: "inventory.read", name: "View inventory" },
  { code: "inventory.write", name: "Adjust inventory" },
  { code: "cash.read", name: "View cash" },
  { code: "cash.write", name: "Manage cash" },
  { code: "cash.close", name: "Close cash session" },
  { code: "bank.read", name: "View banks" },
  { code: "bank.write", name: "Manage banks" },
  { code: "expenses.read", name: "View expenses" },
  { code: "expenses.write", name: "Manage expenses" },
  { code: "vat.read", name: "View VAT" },
  { code: "vat.export", name: "Export VAT" },
  { code: "accounting.read", name: "View accounting" },
  { code: "accounting.write", name: "Manage accounting" },
  { code: "accounting.close_period", name: "Close fiscal period" },
  { code: "reports.read", name: "View reports" },
  { code: "settings.manage", name: "Manage settings" },
  { code: "users.manage", name: "Manage users" },
  { code: "backup.create", name: "Create backups" },
  { code: "backup.restore", name: "Restore backups" },
  { code: "audit.read", name: "View audit logs" }
];
var ROLE_PERMS = {
  OWNER: "ALL",
  MANAGER: [
    "customers.read",
    "customers.write",
    "suppliers.read",
    "suppliers.write",
    "products.read",
    "products.write",
    "sales.read",
    "sales.write",
    "sales.post",
    "purchases.read",
    "purchases.write",
    "purchases.post",
    "purchases.void",
    "inventory.read",
    "inventory.write",
    "cash.read",
    "cash.write",
    "cash.close",
    "bank.read",
    "bank.write",
    "expenses.read",
    "expenses.write",
    "vat.read",
    "vat.export",
    "accounting.read",
    "reports.read",
    "backup.create",
    "audit.read"
  ],
  CASHIER: [
    "customers.read",
    "customers.write",
    "products.read",
    "sales.read",
    "sales.write",
    "sales.post",
    "cash.read",
    "cash.write",
    "inventory.read",
    "reports.read"
  ],
  SALESMAN: [
    "customers.read",
    "products.read",
    "sales.read",
    "sales.write",
    "inventory.read"
  ],
  ACCOUNTANT: [
    "customers.read",
    "suppliers.read",
    "sales.read",
    "purchases.read",
    "expenses.read",
    "expenses.write",
    "vat.read",
    "vat.export",
    "accounting.read",
    "accounting.write",
    "accounting.close_period",
    "bank.read",
    "bank.write",
    "cash.read",
    "reports.read",
    "audit.read",
    "backup.create"
  ]
};
var ACCOUNTS = [
  { code: "1000", name: "Cash on Hand", type: "ASSET", isCashBook: true },
  { code: "1100", name: "Bank Accounts", type: "ASSET", isBankBook: true },
  { code: "1200", name: "Accounts Receivable", type: "ASSET" },
  { code: "1300", name: "Inventory - Gold", type: "ASSET" },
  { code: "1400", name: "Input VAT Recoverable", type: "ASSET" },
  { code: "2000", name: "Accounts Payable", type: "LIABILITY" },
  { code: "2100", name: "Output VAT Payable", type: "LIABILITY" },
  { code: "2200", name: "Customer Advances", type: "LIABILITY" },
  { code: "3000", name: "Owner Capital", type: "EQUITY" },
  { code: "4000", name: "Sales Revenue", type: "REVENUE" },
  { code: "4100", name: "Making Charges Revenue", type: "REVENUE" },
  { code: "5000", name: "Cost of Goods Sold", type: "EXPENSE" },
  { code: "5100", name: "Operating Expenses", type: "EXPENSE" }
];
var EXPENSE_CATEGORIES = [
  { code: "ELECTRIC", name: "Electric Bill" },
  { code: "WATER", name: "Water Bill" },
  { code: "GAS", name: "Gas Bill" },
  { code: "INTERNET", name: "Internet Bill" },
  { code: "PHONE", name: "Phone Bill" },
  { code: "SALARY", name: "Salary" },
  { code: "FUEL", name: "Fuel" },
  { code: "TEA", name: "Tea" },
  { code: "TRANSPORT", name: "Transport" },
  { code: "OFFICE", name: "Office Expense" },
  { code: "REPAIR", name: "Repair" },
  { code: "CLEANING", name: "Cleaning" },
  { code: "PACKAGING", name: "Packaging" },
  { code: "MARKETING", name: "Marketing" },
  { code: "GOV_TAX", name: "Government Tax" },
  { code: "MISC", name: "Miscellaneous" }
];
async function main() {
  console.log("Seeding Jewelry ERP (Oman / OMR)...");
  for (const p of PERMISSIONS) {
    await prisma2.permission.upsert({
      where: { code: p.code },
      update: { name: p.name },
      create: p
    });
  }
  const allPerms = await prisma2.permission.findMany();
  const permByCode = Object.fromEntries(allPerms.map((p) => [p.code, p.id]));
  for (const code of Object.keys(ROLE_PERMS)) {
    const role = await prisma2.role.upsert({
      where: { code },
      update: { name: code.charAt(0) + code.slice(1).toLowerCase() },
      create: {
        code,
        name: code.charAt(0) + code.slice(1).toLowerCase(),
        description: `${code} role`
      }
    });
    await prisma2.rolePermission.deleteMany({ where: { roleId: role.id } });
    const codes = ROLE_PERMS[code] === "ALL" ? PERMISSIONS.map((p) => p.code) : ROLE_PERMS[code];
    for (const c of codes) {
      if (!permByCode[c]) continue;
      await prisma2.rolePermission.create({
        data: { roleId: role.id, permissionId: permByCode[c] }
      });
    }
  }
  const username = process.env.SEED_OWNER_USERNAME || "owner";
  const password = process.env.SEED_OWNER_PASSWORD || "Owner@12345";
  const hash3 = await bcrypt2.hash(password, 10);
  const ownerRole = await prisma2.role.findUniqueOrThrow({ where: { code: "OWNER" } });
  const owner = await prisma2.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      fullName: "Shop Owner",
      email: "owner@jewelry.local",
      passwordHash: hash3,
      roles: { create: [{ roleId: ownerRole.id }] }
    }
  });
  await prisma2.company.upsert({
    where: { id: (await prisma2.company.findFirst())?.id || "seed-company" },
    update: {},
    create: {
      id: "seed-company",
      name: "Al Mas Jewelry",
      address: "Muttrah, Muscat, Sultanate of Oman",
      phone: "+968 2400 0000",
      email: "info@almasjewelry.om",
      crNumber: "CR-000000",
      vatNumber: "OM1234567890",
      currency: "OMR",
      defaultVatRate: 5,
      invoicePrefix: "INV",
      receiptFooter: "Thank you for shopping with us. VAT Inclusive where applicable."
    }
  });
  for (const a of ACCOUNTS) {
    await prisma2.account.upsert({
      where: { code: a.code },
      update: { name: a.name },
      create: {
        code: a.code,
        name: a.name,
        type: a.type,
        isSystem: true,
        isCashBook: a.isCashBook ?? false,
        isBankBook: a.isBankBook ?? false
      }
    });
  }
  for (const c of EXPENSE_CATEGORIES) {
    await prisma2.expenseCategory.upsert({
      where: { code: c.code },
      update: { name: c.name },
      create: c
    });
  }
  const now = /* @__PURE__ */ new Date();
  const rateDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const rates = [
    { karat: "K18", rate: "22.500" },
    { karat: "K21", rate: "26.250" },
    { karat: "K22", rate: "27.500" },
    { karat: "K24", rate: "30.000" }
  ];
  for (const r of rates) {
    const existing = await prisma2.goldRate.findFirst({
      where: {
        karat: r.karat,
        rateDate: {
          gte: rateDate,
          lt: new Date(rateDate.getTime() + 24 * 60 * 60 * 1e3)
        }
      }
    });
    if (existing) {
      await prisma2.goldRate.update({
        where: { id: existing.id },
        data: { ratePerGram: r.rate }
      });
    } else {
      try {
        await prisma2.goldRate.create({
          data: {
            rateDate,
            karat: r.karat,
            ratePerGram: r.rate,
            createdById: owner.id
          }
        });
      } catch (err) {
        const code = err?.code;
        if (code !== "P2002") throw err;
      }
    }
  }
  await prisma2.category.upsert({
    where: { name: "Rings" },
    update: {},
    create: { name: "Rings" }
  });
  await prisma2.category.upsert({
    where: { name: "Necklaces" },
    update: {},
    create: { name: "Necklaces" }
  });
  await prisma2.brand.upsert({
    where: { name: "In-House" },
    update: {},
    create: { name: "In-House" }
  });
  const year = rateDate.getUTCFullYear();
  const month = rateDate.getUTCMonth() + 1;
  await prisma2.fiscalPeriod.upsert({
    where: { year_month: { year, month } },
    update: {},
    create: { year, month, status: "OPEN" }
  });
  console.log(`Owner login: ${username} / ${password}`);
  console.log("Base seed complete.");
  if (process.env.SEED_DEMO === "1" || process.env.SEED_DEMO === "true") {
    console.log("Loading demo data (SEED_DEMO=1)...");
    const { seedDemoData: seedDemoData2 } = await Promise.resolve().then(() => (init_seed_demo(), seed_demo_exports));
    await seedDemoData2();
    console.log("Demo seeding finished.");
  } else {
    console.log("Skipped demo data (set SEED_DEMO=1 to include).");
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma2.$disconnect();
});
