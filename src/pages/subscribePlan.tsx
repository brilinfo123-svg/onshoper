import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // ✅ Next.js router for redirect
import styles from "../styles/subscriptionPlain.module.scss";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

interface ShopOwner {
    createdAt: string | number | Date;
    _id?: string;
    shopOwnerID?: string;
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

    
    const shopOwnerID = "691b43b2d46ea7262b270b4c"; // use real ID

    // Fetch shopOwner
    useEffect(() => {
        if (!shopOwnerID) return;
        const fetchShopOwner = async () => {
            try {
                const res = await fetch(`/api/shopOwner/SubscriptionPlan?shopOwnerID=${shopOwnerID}`);
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
    }, [shopOwnerID]);

    // Per-category countdown
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

        // ✅ If expired → new expiry starts from now
        if (expiryDate <= now) {
            newExpiry = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months
            message = `Your subscription for "${payment.category}" has expired. 
                 Renewing will give you new validity until ${newExpiry.toLocaleDateString()}.`;
        } else {
            // ✅ If still active → extend expiry
            newExpiry = new Date(expiryDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months
            message = `Your subscription for "${payment.category}" is still active. 
                 Renewing will extend it by +2 months. 
                 New expiry will be ${newExpiry.toLocaleDateString()}.`;
        }

        // ✅ Show SweetAlert
        Swal.fire({
            title: "🔄 Renew Subscription",
            html: `<p>${message}</p>`,
            icon: "info",
            confirmButtonText: "Go to Payment",
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirect to payment page
                router.push({
                    pathname: "/subscription",
                    query: {
                        shopOwnerID,
                        category: payment.category,
                        amount: payment.amount,
                    },
                });
            }
        });
    };

    console.log("Aakash", session, shopData);

    return (
            <div className={styles.wrapper}>
                <div className={styles.card}>
                    {shopOwnerLoading ? (
                        <p className={styles.loading}>Loading subscription...</p>
                    ) : !shopData?.shopOwner ? (
                        <p className={styles.error}>No ShopOwner data found</p>
                    ) : (
                        <div className={styles.countdownTable}>
                           <div className={styles.sectionHeader}>
                                <h2 className={styles.title}><span className="icon-calendar"></span> Category Validity</h2>
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
                                            <td>{payment.category}</td>
                                            <td>₹{payment.amount}</td>
                                            <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                            <td>{new Date(payment.expiryAt).toLocaleDateString()}</td>
                                            <td
        className={
          countdowns[payment.category] === "Expired"
            ? styles.expired
            : styles.active
        }
      >
        {countdowns[payment.category] || "Loading..."}
      </td>
                                            <td>
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
            </div>
    );
}
