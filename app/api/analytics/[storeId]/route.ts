import { getAppointmentsByStoreId, getServicesByStoreId } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { storeId } = params;
  const appointments = await getAppointmentsByStoreId(storeId);
  const services = await getServicesByStoreId(storeId);
  return NextResponse.json({ appointments, services });
}
