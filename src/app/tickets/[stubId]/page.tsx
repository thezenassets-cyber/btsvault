import { TicketDocument } from "@/components/tickets/ticket-document";

export const metadata = {
  title: "Ticket — ARMY Vault",
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ stubId: string }>;
}) {
  const { stubId } = await params;
  return <TicketDocument stubId={decodeURIComponent(stubId)} />;
}
