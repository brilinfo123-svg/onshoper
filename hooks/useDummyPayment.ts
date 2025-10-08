import { useState } from 'react';
import { useRouter } from 'next/router';

export function useDummyPayment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const triggerPayment = async ({
    shopOwnerID,
    category,
    amount
  }: {
    shopOwnerID: string;
    category: string;
    amount: number;
  }) => {
    if (!shopOwnerID) {
      alert("Shop owner ID not found. Please log in again.");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopOwnerID,
            transactionId: `dummy_txn_${Date.now()}`,
            method: 'Dummy',
            amount,
            category
          })
        });

        alert(`Dummy payment successful for category "${category}"`);
        router.push('/ProductForm');
      } catch (error) {
        console.error("Payment failed:", error);
        alert("Payment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return { triggerPayment, loading };
}
