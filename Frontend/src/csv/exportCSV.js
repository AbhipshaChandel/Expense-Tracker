// src/utils/exportCSV.js

export function exportTransactionsToCSV(transactions) {
  if (!transactions || transactions.length === 0) {
    alert("No transactions available to export.");
    return;
  }

  const headers = [
    "Date",
    "Description",
    "Category",
    "Type",
    "Amount (INR)",
  ];

  // Escape values correctly for CSV files.
  const escapeCSV = (value) => {
    let text = String(value ?? "");

    // Help prevent spreadsheet formula injection in text fields.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    // Escape quotation marks by doubling them.
    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = transactions.map((transaction) => [
    transaction.createdAt
      ? new Date(transaction.createdAt).toISOString().slice(0, 10)
      : "",
    transaction.text,
    transaction.category,
    transaction.type,
    transaction.amount,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  // Add a UTF-8 BOM to improve compatibility with Excel.
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `expense-tracker-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}