import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "../styles/favorites.module.scss";
import { useRouter } from "next/router";
import ProductCard from "@/components/ProductCard/Index";
import { toast } from "react-toastify";
import Image from "next/image";

interface FavoriteShop {
  email: string;
  userEmail: string;
  currentLocation: string;
  services: any;
  distance: string;
  _id: string;
  offers: any;
  businessName: string;
  featured: boolean;
  latitude: number;
  longitude: number;
  isFavorite: boolean;
  profileImage: string;
  shopId: string;
  name: string;
  address: string;
  category: string;
  image: string;
}

interface ShopData {
  email: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  [key: string]: any; // Additional fields dynamically
  registration: any;
  shop: any;
}

const FavoritesPage = () => {
  const [favoriteShops, setFavoriteShops] = useState<FavoriteShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const router = useRouter();
  
  console.log("Favorite Shops:", favoriteShops);

   // Fetch Shop Data
   useEffect(() => {
    if (!session?.user?.contact) return;

    const fetchShopData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/profile?userEmail=${session.user.contact}`);
        if (!response.ok) throw new Error("Error fetching shop data");

        const data: ShopData = await response.json();
        setShopData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [session]);

  const MyShopeUserID = shopData?.user?._id;
  const ShopeUserID = shopData?.shop?._id;
  const getAllData = shopData?.shop;

  console.log("User Shop ID:", ShopeUserID);

   // Fetch Favorite Shops
   useEffect(() => {
    if (!MyShopeUserID) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/getFavorites?userId=${MyShopeUserID}`);
        if (!response.ok) throw new Error("Failed to fetch favorite shops");

        const data = await response.json();
        setFavoriteShops(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [MyShopeUserID]);

  // Toggle favorite status in the favorites page
  const toggleFavoriteInPage = async (userShopId: string, isFavorite: boolean) => {
    const newFavoriteStatus = !isFavorite;
    const updatedShops = favoriteShops.map((shop) =>
      shop.shopId === userShopId
        ? { ...shop, isFavorite: newFavoriteStatus }
        : shop
    );
    setFavoriteShops(updatedShops);

    try {
      const response = await fetch("/api/subscribeShop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myShopUserID: MyShopeUserID,
          shopUserID: userShopId,
          isFavorited: newFavoriteStatus,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(newFavoriteStatus ? "Subscribed successfully!" : "Removed from favorites Aakash!");
      } else {
        throw new Error(data.error || "Failed to update favorite status");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
     <center> <h1 className={styles.title}>Your Favorite Shops</h1></center>
      {/* Show loading indicator */}
     

      {/* Show error message */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Show when no favorites are found */}
      

      {/* Favorite Shops List */}

      
      <div className={styles.rowFlex}>

       <div className={styles.sidebar}>
         <Image src="/images/adsFreeImg.jpg" width="300" height="600" alt="" />
       </div>

       
        <div className={styles.FavoritesShops}>
          {!loading && !error && favoriteShops.length === 0 && (
          <p className={styles.noFavorites}>No favorite shops found.</p>
        )}
        {loading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <p>Loading your favorite shops...</p>
        </div>
      )}
        {!loading && favoriteShops.length > 0 && (
          <div className={styles.productGrid}>
            
            {favoriteShops
              .sort((a, b) => Number(b.featured) - Number(a.featured))
              .map((shop) => (
                <ProductCard
                  key={shop._id}
                  image={shop.profileImage || "/images/img2.jpg"}
                  allShopData={getAllData}
                  MyShopId={MyShopeUserID}
                  myshopEmailID={shop.userEmail}
                  shopName={shop.businessName}
                  shopDescription={shop?.offers?.[0]?.offerDescription || "No description available"}
                  userShopId={shop.shopId}
                  contact={`/localShop/${shop.shopId}`}
                  distance={shop.distance || "N/A"}
                  isFavorite={shop.isFavorite || false}
                  offer={shop.services?.[0]?.discount || ""}
                  location={shop?.currentLocation || "Location not available"}
                  isFeatured={shop.featured || false}
                  latitude={shop.latitude || 0}
                  longitude={shop.longitude || 0}
                  toggleFavorite={() => toggleFavoriteInPage(shop.shopId, shop.isFavorite)}
                />
              ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
