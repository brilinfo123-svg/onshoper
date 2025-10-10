import { useEffect, useState } from "react";

import styles from "@/styles/package.module.scss";
import { withProtectedPage } from "@/components/withProtectedPage";
import FeatureButton from "@/components/FeaturedButton/Index";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import Swal from "sweetalert2";
import Head from "next/head";

interface ShopData {
  email: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  [key: string]: any;
  registration: any;
  shop: any;
}
const categoryPrices: Record<string, number> = {
  Car: 500,
  Mobiles: 250,
  Furniture: 199,
  Fashion: 99,
  Jobs: 199,
  Vehicles: 250,
  Services: 120,
  "Real Estate": 499,
  "Pets & Pet Care": 120,
  "Electronics & Appliances": 150,
  "Commercial Vehicles": 200,
  "Books & Sports": 99,
  "Tools & Equipment": 99,
  "Education & Learning": 199,
  "Events & Entertainment": 250,
};

function Package() {
  const { data: session } = useSession();
  const router = useRouter();
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const [loading, setLoading] = useState(false);

    console.log("shopOwnerID", session);
  
    const shopOwnerID = shopData?.user?._id;
    const rawCategory = router.query.category?.toString() || "Car";
    const category = decodeURIComponent(rawCategory).trim();
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
    
      const handleRazorpayPayment = async () => {
        if (!shopOwnerID) {
          Swal.fire({
            title: "Missing Info",
            text: "Shop owner ID not found. Please log in again.",
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }
      
        setLoading(true);
      
        const res = await fetch("/api/payment/createOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, category }),
        });
      
        const { order } = await res.json();
      
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: order.amount,
          currency: order.currency,
          name: "OnShoper",
          description: `Featured Ads for ${category}`,
          order_id: order.id,
          handler: async function (response) {
            await fetch("/api/payment/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shopOwnerID,
                transactionId: response.razorpay_payment_id,
                method: "Razorpay",
                amount,
                category,
              }),
            });
      
            Swal.fire({
              title: "Payment Successful",
              html: `
                <p>Payment successful for category <strong>${category}</strong>.</p>
                <p>You can now post <strong>unlimited featured ads</strong> for 2 months in this category.</p>
              `,
              icon: "success",
              confirmButtonText: "Start Posting",
            }).then(() => {
              router.push("/ProductForm");
            });
          },
          prefill: {
            email: session?.user?.email,
            contact: session?.user?.contact,
          },
          theme: { color: "#3399cc" },
        };
      
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      };
      
      


  return (
    <>
    <Head>
        <title>Subscription Plans – OnShoper</title>
        <meta
          name="description"
          content="Choose the best subscription plan on OnShoper to boost your listings, get premium visibility, and reach more buyers."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />

        {/* Optional: Social Sharing */}
        <meta property="og:title" content="Subscription Plans – OnShoper" />
        <meta property="og:description" content="Upgrade your OnShoper experience with premium plans. Get featured listings and priority support." />
        <meta property="og:image" content="/images/og-subscription.jpg" />
        <meta property="og:url" content="https://onshoper.com/subscription" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
    <div className={styles.mainWrapr}>
      <div className={styles.packageContainer}>
        <div className="packageWrap">
         <h1>Unlimited Featured Ads for 2 Months</h1>
          <p className={styles.description}>Pay once and enjoy unlimited featured ads in your selected category for 2 months.</p>
          <div className={styles.packageCard}>
            <div className="Wrapper">
              <h2>🔥 2-Month Featured Listing</h2>
              <ul>
                <li>📌 Every ad you post will appear at the top of search results.</li>
                <li>⭐ All your ads will carry a special Featured Badge for extra visibility.</li>
                <li>🚀 Boost your shop’s reach without paying again for each listing.</li>
                <li>🔁 Post multiple ads under the same category — all will be featured automatically.</li>
              </ul>

            </div>
            <div className={styles.SubscriptionMainHead}>
              {/* <h3 className={styles.price}>₹999 / 2 months</h3> */}
              
              {session?.user?.id ? (
                <>

                <p className={styles.category}>Category: <strong>{category}</strong></p>      
                <p className={styles.price}>Total: <span> ₹{amount}</span></p>
                <button onClick={handleRazorpayPayment} disabled={loading || !shopOwnerID} className={styles.featureButton}>
                  {loading ? 'Processing...' : `Proceed Payment`}
                </button>
                 {/* <FeatureButton shopOwnerID={session.user.id} /> */}
                </>
              ) : (
                <p>Please login first.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default withProtectedPage(Package);
