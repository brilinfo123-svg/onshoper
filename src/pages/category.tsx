import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/category.module.scss";
import { withProtectedPage } from "@/components/withProtectedPage";
// import { useSession, signIn } from "next-auth/react";

const Categories: React.FC = () => {

    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const categories = [
        "Technology",
        "Fashion",
        "Health & Beauty",
        "Food & Beverages",
        "Education",
        "Sports",
        "Home Services",
        "Automotive",
        "Entertainment",
        "Real Estate",
        "Finance",
        "Construction",
        "Travel",
        "Retail",
        "Music",
        "Legal Services",
        "Fitness",
        "Events",
        "Arts",
        "Books & Stationery",
        "Pet Supplies",
        "Toys & Games",
        "Jewelry & Accessories",
        "Photography",
        "Gardening & Outdoor",
        "Appliances",
        "Craft & DIY",
        "Baby & Kids",
        "Gifts & Novelties",
        "Luxury Goods",
        "Watches",
        "Grocery & Supermarket",
        "Auto Parts & Accessories",
        "Furniture & Décor",
        "Home Improvement",
        "Healthcare & Medical",
        "Cleaning Supplies",
        "Renewable Energy",
        "Security & Surveillance",
        "Bakeries",
        "Catering Services",
        "Coffee Shops",
        "Juice Bars",
        "Fast Food",
        "Ice Cream & Desserts",
        "Organic Food Stores",
        "Seafood Markets",
        "Butcher Shops",
        "Delis & Sandwich Shops",
        "Ethnic Food",
        "Farmers Markets",
        "Vegan & Vegetarian Food",
        "Gourmet & Specialty Foods",
        "Meal Prep Services",
        "Wine & Spirits",
        "Specialty Coffee",
        "Food Trucks",
        "Auto Repair Shops",
        "Car Wash & Detailing",
        "Tire Shops",
        "Auto Body Shops",
        "Oil Change Services",
        "Car Rental Services",
        "Auto Glass Repair",
        "Car Dealerships",
        "Mobile Mechanics",
        "Towing Services",
        "Auto Parts Stores",
        "Vehicle Inspections",
        "Car Upholstery & Interior Cleaning",
        "Brake Services",
        "Car Audio & Electronics Installation",
        "Auto Customization & Performance",
        "Fleet Services",
        "Plumbers",
        "Toilet Cleaning Services",
        "Bathroom Deep Cleaning",
        "Home Cleaning Services",
        "Kitchen Cleaning Services",
        "Sofa & Carpet Cleaning",
        "Window Cleaning Services",
        "Chimney Cleaning Services",
        "Water Tank Cleaning",
        "Pest Control Services",
        "Electricians",
        "Appliance Repair Technicians",
        "Carpenters",
        "Painters",
        "Interior Designers",
        "Garden Maintenance",
        "Roof Repair Services",
        "Furniture Assembly",
        "Handyman Services",
        "Curtain & Blinds Installation",
        "Home Sanitization Services",
        "Water Purifier Installation & Repair",
        "Septic Tank Cleaning",
        "Air Conditioner Servicing",
        "Geyser Installation & Repair",
        "Solar Panel Installation",
        "Door & Lock Repair",
        "Key Makers",
        "Wall Drilling Services",
        "Wallpaper Installation",
        "Packers & Movers",
        "Waste Recycling Services",
        "Laundry & Dry Cleaning Services",
        "Burger Joints",
        "Pizza Shops",
        "Fried Chicken Outlets",
        "Taco Stands",
        "Hot Dog Stalls",
        "Kebab Shops",
        "Shawarma Stalls",
        "Pasta & Noodles Stations",
        "Dumpling Shops",
        "Wrap & Roll Outlets",
        "Pakoda & Bhajiya Stalls",
        "Samosa & Kachori Vendors",
        "Chaat Corners",
        "Fries & Snacks Bars",
        "Donut Shops",
        "Waffle Stalls",
        "Pav Bhaji Vendors",
        "Vada Pav Stalls",
        "Street Food Trucks",
        "Biryani Takeaways",
        "Milkshake & Smoothie Bars",
        "Popcorn & Candyfloss Stalls",
        "Ice Cream Trucks",
        "Healthy Fast Food Options",
        "Local Specialty Fast Food",
        "Chinese Takeaway",
        "Momos Stalls",
        "BBQ & Grill Outlets",
        "Fusion Food Joints",
        "Mini Cafes",
        "Dessert Parlors",
        "Bubble Tea Shops",
        "Thali Restaurants",
        "Quick-Service Restaurants (QSR)",
        "KFC",
        "Dominos",
        "Chicken Mutton",
        "None Veg"
    ];

    const handleCategoryClick = (category: string) => {
        const formattedCategory = category.replace(/\s+/g, "-");
        router.push(`/ProductForm?category=${formattedCategory}`);
    };

    // Filter categories based on search term
    const filteredCategories = categories.filter((category) =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <div className={styles.chooseCategory}>
                <div className={styles.searchBarWrap}>
                <h1>Select Your Shop Category</h1>
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchBar}
                />
                </div>
                <div className={styles.categories}>
                    {filteredCategories.map((category) => (
                        <div key={category} className={styles.categoryItem} onClick={() => handleCategoryClick(category)}>
                         <span className="icon-shop"></span> {category}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default withProtectedPage(Categories);
