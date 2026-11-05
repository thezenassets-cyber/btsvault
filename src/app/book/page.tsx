import { Suspense } from "react";
import { BookDesk } from "@/components/booking/book-desk";

export default function BookPage() {
  return (
    <Suspense fallback={<div className="px-4 py-24 text-center text-cream/50">Loading the booking desk…</div>}>
      <BookDesk />
    </Suspense>
  );
}
