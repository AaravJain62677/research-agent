import axios from "axios";

import { Receipt } from "./state";

export async function payAndCall(
  url: string,
  body: unknown,
  taskId: string,
  service: string
): Promise<{ data: any; receipt: Receipt }> {
  const receipt: Receipt = {
    task_id: taskId,
    service,
    amount: 0.01,
    asset: "USDC",
    tx_hash: "0xdummy" + taskId,
    status: "settled",
    timestamp: Date.now(),
  };
  return {
    data: { result: `dummy result for ${service}`, sources: ["https://example.com"] },
    receipt,
  };
}

/* REAL IMPLEMENTATION — restore this once wallet is funded and payClient above is uncommented:

export async function payAndCall(
  url: string,
  body: unknown,
  taskId: string,
  service: string
): Promise<{ data: any; receipt: Receipt }> {
  try {
    const res = await payClient.post(url, body);
    const receipt: Receipt = {
      task_id: taskId,
      service,
      amount: res.data?.receipt?.amount ?? 0,
      asset: res.data?.receipt?.asset ?? "USDC",
      tx_hash: res.data?.receipt?.tx_hash ?? "",
      status: "settled",
      timestamp: Date.now(),
    };
    return { data: res.data, receipt };
  } catch (err) {
    const receipt: Receipt = {
      task_id: taskId,
      service,
      amount: 0,
      asset: "USDC",
      tx_hash: "",
      status: "failed",
      timestamp: Date.now(),
    };
    throw { error: err, receipt };
  }
}

*/