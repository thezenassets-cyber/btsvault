import { notFound } from "next/navigation";
import { concerts, getConcertById, isSellableConcert } from "@/data/concerts";
import { EventBoxOffice } from "@/components/tickets/event-box-office";

export function generateStaticParams() {
  return concerts.filter(isSellableConcert).map((concert) => ({ id: concert.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const concert = getConcertById(id);
  if (!concert) return { title: "Show — ARMY Vault" };
  return {
    title: `${concert.city} seats — ARMY Vault Box Office`,
    description: `Choose a Front, Middle, or Back roll seat at ${concert.venue}.`,
  };
}

export default async function BoxOfficeEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const concert = getConcertById(id);
  if (!concert || !isSellableConcert(concert)) notFound();
  return <EventBoxOffice concert={concert} />;
}
