import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '@/styles/PaymentPage.module.scss'; // ✅ SCSS import

interface ShopData {
  user: any;
  email: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  registration: any;
  shop: any;
  favourites?: any;
}

const categoryPrices: Record<string, number> = {
  Car: 199,
  Mobiles: 99,
  Furniture: 49,
  Electronics: 79,
  Jobs: 149
};

export default function DummyPaymentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(false);

  const shopOwnerID = shopData?.user?._id;
  const category = router.query.category?.toString() || "Car";
  const amount = categoryPrices[category] || 99;

  useEffect(() => {
    if (session?.user?.contact) {
      const fetchShopData = async () => {
        try {
          const response = await fetch(`/api/profile?userEmail=${session.user.contact}`);
          if (response.ok) {
            const data: ShopData = await response.json();
            setShopData(data);
          }
        } catch (error) {
          console.error("Error fetching shop data:", error);
        }
      };

      fetchShopData();
    }
  }, [session]);

  const handleDummyPayment = async () => {
    if (!shopOwnerID) {
      alert("Shop owner ID not found. Please log in again.");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
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
    }, 1500);
  };

  return (
    <div className={styles.paymentContainer}>
      <h1 className={styles.heading}>Unlock Unlimited Product Uploads</h1>
      <p className={styles.category}>Category: <strong>{category}</strong></p>
      <p className={styles.price}>Pay ₹{amount} to remove the 2-product limit.</p>
      <button
        onClick={handleDummyPayment}
        disabled={loading || !shopOwnerID}
        className={styles.payButton}
      >
        {loading ? 'Processing...' : `Simulate Payment ₹${amount}`}
      </button>
    </div>
  );
}
