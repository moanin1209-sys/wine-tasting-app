'use client';

import WishlistForm from '@/components/WishlistForm';

export default function NewWishlistPage() {
  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold mb-6">마시고 싶은 와인</h1>
      <WishlistForm />
    </div>
  );
}
