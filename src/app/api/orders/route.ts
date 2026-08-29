import { NextResponse } from "next/server";
import { createOrder, OrderError } from "@/server/order-store";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { table, note, items } = (body ?? {}) as Record<string, unknown>;

  try {
    const order = createOrder({ table, note, items });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
