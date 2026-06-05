"use client";

import { useParams } from "next/navigation";
import { useListing } from "@/features/properties/hooks";
import ListingForm from "../listing-form";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function EditListingPage() {
  const params = useParams();
  const id = params.id as string;
  const { listing, loading } = useListing(id);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <ListingForm mode="edit" listing={listing} />;
}
