import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/subscriptionPlain.module.scss";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal/Index";

interface ShopOwner {
  createdAt: string | number | Date;
  _id?: string;
  contact?: string;       // 👈 use contact instead of shopOwnerID
  name?: string;
  planType?: string;
  hasPaid?: boolean;
  paidCategories?: string[];
  paymentHistory?: {
    category: string;
    amount: number;
    createdAt: string;
    expiryAt: string;
    transactionId: string;
    method: string;
  }[];
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [shopOwnerLoading, setShopOwnerLoading] = useState(true);
  const [shopData, setShopData] = useState<{ shopOwner?: ShopOwner }>({});
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const router = useRouter();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);


  const categoriesWithIcone = [
    { name: "Real Estate", icon: "/icons/residential.png" },
    { name: "Services", icon: "/icons/customer-service.png" },
    { name: "Commercial Vehicles", icon: "/icons/truck.png" },
    { name: "Vehicles", icon: "/icons/motor-sports.png" },
    { name: "Mobiles", icon: "/icons/mobile-app.png" },
    { name: "Events & Entertainment", icon: "/icons/banner.png" },
    { name: "Education & Learning", icon: "/icons/light-bulb.png" },
    { name: "Tools & Equipment", icon: "/icons/settings.png" },
    { name: "Pets & Pet Care", icon: "/icons/pets.png" },
    { name: "Jobs", icon: "/icons/businessman.png" },
    { name: "Books & Sports", icon: "/icons/referee.png" },
    { name: "Fashion", icon: "/icons/dress.png" },
    { name: "Furniture", icon: "/icons/furnitures.png" },
    { name: "Electronics & Appliances", icon: "/icons/device.png" },
    { name: "Car", icon: "/icons/car.png" },
    { name: "Spare Parts", icon: "/icons/adapter.png" },
    { name: "Default", icon: "/icons/sketch-book.png" }
  ];



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories"); // 👈 your API endpoint
        const data = await res.json();
        if (res.ok && data.success) {
          setCategories(data.categories); // e.g. ["Electronics & Appliances", "Fashion", ...]
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // fallback if API fails
        setCategories(["Electronics & Appliances", "Fashion", "Real Estate", "Vehicles", "Services"]);
      }
    };
    fetchCategories();
  }, []);
  // ✅ Get contact from session
  const contact = session?.user?.contact;

  // ✅ Fetch shopOwner by contact
  useEffect(() => {
    if (!contact) return;
    const fetchShopOwner = async () => {
      try {
        const res = await fetch(`/api/shopOwner/SubscriptionPlan?contact=${contact}`);
        const data = await res.json();
        console.log("API Response:", data);

        if (res.ok && data.success) {
          setShopData({ shopOwner: data.shopOwner });
        } else {
          setShopData({ shopOwner: undefined });
        }
      } catch (error) {
        console.error("Error fetching shopOwner:", error);
      } finally {
        setShopOwnerLoading(false);
      }
    };
    fetchShopOwner();
  }, [contact]);

  // ✅ Per-category countdown
  useEffect(() => {
    if (shopOwnerLoading || !shopData?.shopOwner?.paymentHistory) return;

    const updateCountdowns = () => {
      const now = new Date();
      const newCountdowns: Record<string, string> = {};

      shopData.shopOwner?.paymentHistory?.forEach((payment) => {
        const endDate = new Date(payment.expiryAt);
        const diff = endDate.getTime() - now.getTime();

        if (diff <= 0) {
          newCountdowns[payment.category] = "Expired";
        } else {
          const remainingSeconds = Math.floor(diff / 1000);
          const days = Math.floor(remainingSeconds / (3600 * 24));
          const hours = Math.floor((remainingSeconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((remainingSeconds % 3600) / 60);
          const seconds = remainingSeconds % 60;

          newCountdowns[payment.category] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });

      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const timer = setInterval(updateCountdowns, 1000);
    return () => clearInterval(timer);
  }, [shopOwnerLoading, shopData.shopOwner?.paymentHistory]);

  // ✅ Renew handler
  const handleRenew = (payment: any) => {
    const now = new Date();
    const expiryDate = new Date(payment.expiryAt);

    let message = "";
    let newExpiry: Date;

    if (expiryDate <= now) {
      newExpiry = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months
      message = `Your subscription for "${payment.category}" has expired. 
        Renewing will give you new validity until ${newExpiry.toLocaleDateString()}.`;
    } else {
      newExpiry = new Date(expiryDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months
      message = `Your subscription for "${payment.category}" is still active. 
        Renewing will extend it by +2 months. 
        New expiry will be ${newExpiry.toLocaleDateString()}.`;
    }

    Swal.fire({
      title: "🔄 Renew Subscription",
      html: `<p>${message}</p>`,
      icon: "info",
      confirmButtonText: "Go to Payment",
      showCancelButton: true,
      customClass: {
        popup: "swal-popup",
        title: "swal-title",
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push({
          pathname: "/subscription",
          query: {
            contact, // 👈 send contact instead of shopOwnerID
            category: payment.category,
            amount: payment.amount,
          },
        });
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {shopOwnerLoading ? (
          <p className={styles.loading}>Loading subscription...</p>
        ) : !shopData?.shopOwner ? (
          <div className={styles.infoBox}>
            <div>
              <h4 className={styles.infoTitle}>No Active Subscriptions Found</h4>
              {/* <button
                className={styles.subscribeBtn}
                onClick={() => setShowCategoryModal(true)}
              >
                🔓 Unlock Categories
              </button> */}
            </div>
          </div>

        ) : (
          <div className={styles.countdownTable}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.title}>
                Subscription Status
              </h2>
              <p className={styles.description}>
                Track your subscription categories, expiry dates, and remaining time.
                Renew easily to keep posting products without interruption.
              </p>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Created At</th>
                  <th>Expiry At</th>
                  <th>Time Left</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shopData.shopOwner.paymentHistory?.map((payment) => (
                  <tr key={payment.category}>
                    <td data-label="Category">{payment.category}</td>
                    <td data-label="Amount">₹{payment.amount}</td>
                    <td data-label="Created At">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td data-label="Expiry At">{new Date(payment.expiryAt).toLocaleDateString()}</td>
                    <td
                      data-label="Time Left"
                      className={
                        countdowns[payment.category] === "Expired"
                          ? styles.expired
                          : styles.active
                      }
                    >
                      {countdowns[payment.category] || "Loading..."}
                    </td>
                    <td data-label="Action">
                      <button
                        className={styles.renewBtn}
                        onClick={() => handleRenew(payment)}
                      >
                        🔄 Renew
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <h3>Select a Category</h3>
        <p>Choose a category to subscribe and start listing products for sale or rent.</p>

        <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
          <h3>Select a Category</h3>
          <p>Choose a category to subscribe and start listing products for sale or rent.</p>

          <div className={styles.categoryList}>
            {categoriesWithIcone.map((cat) => (
              <button
                key={cat.name}
                className={styles.categoryOption}
                onClick={() => {
                  setShowCategoryModal(false);
                  router.push(`/subscription?category=${cat.name}`);
                }}
              >
                <img src={cat.icon} alt={cat.name} className={styles.categoryIcon} />
                <span className={styles.categoryLabel}>{cat.name}</span>
              </button>
            ))}
          </div>

        </Modal>

      </Modal>

    </div>
  );
}
