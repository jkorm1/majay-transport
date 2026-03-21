// Form validation utilities

export interface ValidationError {
  field: string
  message: string
}

export function validateSale(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Basic field validation
  if (!data.date) {
    errors.push({ field: "date", message: "Date is required" })
  }

  if (!data.employee) {
    errors.push({ field: "employee", message: "Employee is required" })
  }

  if (!data.product || data.product.trim() === "") {
    errors.push({ field: "product", message: "Product name is required" })
  }

  const quantity = Number.parseFloat(data.quantity)
  if (!data.quantity || isNaN(quantity) || quantity <= 0) {
    errors.push({ field: "quantity", message: "Quantity must be a positive number" })
  }

  const price = Number.parseFloat(data.price)
  if (!data.price || isNaN(price) || price <= 0) {
    errors.push({ field: "price", message: "Price must be a positive number" })
  }

  // Calculate total
  const total = quantity * price
  if (isNaN(total) || total <= 0) {
    errors.push({ field: "total", message: "Invalid total amount" })
  }

  // Validate calculated fields
  const businessFund = Number(data.businessFund)
  if (isNaN(businessFund) || businessFund !== (total * 0.6)) {
    errors.push({ field: "businessFund", message: "Business fund must be 60% of total" })
  }

  const employeeShare = Number(data.employeeShare)
  if (isNaN(employeeShare) || employeeShare !== (total * 0.15)) {
    errors.push({ field: "employeeShare", message: "Employee share must be 15% of total" })
  }

  const investorShare = Number(data.investorShare)
  if (isNaN(investorShare) || investorShare !== (total * 0.15)) {
    errors.push({ field: "investorShare", message: "Investor share must be 15% of total" })
  }

  const savings = Number(data.savings)
  if (isNaN(savings) || savings !== (total * 0.1)) {
    errors.push({ field: "savings", message: "Savings must be 10% of total" })
  }

  // Verify the total matches the sum of all parts
  const sumOfParts = businessFund + employeeShare + investorShare + savings
  if (Math.abs(total - sumOfParts) > 0.01) {
    errors.push({ field: "total", message: "Total must equal sum of all parts" })
  }

  return errors
}

export function validateExpense(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.date) {
    errors.push({ field: "date", message: "Date is required" })
  }

  if (!data.category) {
    errors.push({ field: "category", message: "Category is required" })
  }

  const amount = Number.parseFloat(data.amount)
  if (!data.amount || isNaN(amount) || amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be a positive number" })
  }

  return errors
}

export function validateWithdrawal(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.date) {
    errors.push({ field: "date", message: "Date is required" })
  }

  const amount = Number.parseFloat(data.amount)
  if (!data.amount || isNaN(amount) || amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be a positive number" })
  }

  if (!data.purpose || data.purpose.trim() === "") {
    errors.push({ field: "purpose", message: "Purpose is required" })
  }

  if (!data.type || !["withdrawal", "repayment"].includes(data.type)) {
    errors.push({ field: "type", message: "Type must be either withdrawal or repayment" })
  }

  return errors
}
