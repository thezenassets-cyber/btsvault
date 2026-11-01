import { shopMembers } from "@/data/members";
import { MemberCard } from "@/components/members/member-card";

export const metadata = {
  title: "Member Shops — ARMY Vault",
  description: "Browse private merchandise collections for each BTS member.",
};

export default function MembersIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center sm:text-left">
        <p className="text-sm font-medium tracking-widest text-purple-glow uppercase">
          Seven Shops · One Vault
        </p>
        <h1 className="mt-3 text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
          Member Collections
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-cream/60 sm:mx-0">
          Each member has a curated private shop — solo albums, photocards, apparel, and rare
          handouts. Build your cart member by member.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shopMembers.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
