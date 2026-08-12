import { DatabaseSync } from "node:sqlite";
import path from "path";
import { Receipt } from "../graph/state";

const db = new DatabaseSync(path.join(__dirname, "receipts.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS receipts (
    task_id TEXT,
    service TEXT,
    amount REAL,
    asset TEXT,
    tx_hash TEXT,
    status TEXT,
    timestamp INTEGER
  )
`);

const insertStmt = db.prepare(
  `INSERT INTO receipts (task_id, service, amount, asset, tx_hash, status, timestamp)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

export function writeReceipt(r: Receipt): void {
  insertStmt.run(r.task_id, r.service, r.amount, r.asset, r.tx_hash, r.status, r.timestamp);
}

export function getAllReceipts(): Receipt[] {
  return db.prepare(`SELECT * FROM receipts ORDER BY timestamp ASC`).all() as unknown as Receipt[];
}

export function getTotalSpent(): number {
  const row = db
    .prepare(`SELECT SUM(amount) as total FROM receipts WHERE status = 'settled'`)
    .get() as { total: number | null } | undefined;
  return row?.total ?? 0;
}