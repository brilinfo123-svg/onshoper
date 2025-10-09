"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/ProductForm.module.scss";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import PickupLocationSearch from "@/components/PickupLocationSearch/Index";
import { withProtectedPage } from "@/components/withProtectedPage";
import Link from "next/link";
import IndiaAddressForm from "@/components/India/Index";
import Swal from "sweetalert2";
import Head from "next/head";

const categories = {
  Vehicles: ["Motorcycles", "Scooters", "Bicycles", "Spare Parts"],
  Car: ["Cars", "Spare Parts"],
  "Commercial Vehicles": ["Tractors", "E-Rickshaws", "Tippers", "Tankers", "Pickups", "Delivery Vans", "Mini Trucks", "Passenger Buses", "School Buses", "Tempo Travellers", "Auto Rickshaws", "Commercial SUVs", "Refrigerated Vans", "Construction Vehicles"],
  "Electronics & Appliances": ["TV & Video", "Computers & Laptops", "Home Appliances", "ACs & Coolers", "Kitchen Appliances", "Cameras & Accessories", "Gaming Consoles", "Smart Home Devices", "Power Banks & Chargers", "Projectors",
    "Monitors & Accessories", "Printers & Scanners", "Water Purifiers", "Heaters & Geysers", "Audio & Music Systems", "Washing Machines", "Other Electronics",],
  Furniture: ["Beds & Wardrobes", "Sofas & Dining", "Tables & Chairs", "Home Decor & Garden", "Mattresses", "Office Furniture", "Other Household Items"],
  Fashion: ["Men’s Clothing", "Women’s Clothing", "Kids", "Footwear", "Eyewear", "Ethnic Wear"],
  "Books & Sports": ["Books", "Gym & Fitness", "Musical Instruments", "Sports Equipment", "Collectibles", "Board Games", "Toys"],
  "Real Estate": ["House & Apartments", "Commercial Properties", "PG & Guest House", "Shops & Offices", "Land & Plots"],
  Services: ["Home Services", "Repair", "Event Services", "Packers & Movers", "Health & Wellness", "Tutors & Classes", "Photography", "Legal & Documentation"],
  Jobs: ["Part-time", "Full-time", "Internships", "Work from Home", "Freelancers", "Driver Jobs", "Delivery Jobs", "Office Jobs"],
  "Pets & Pet Care": ["Dogs", "Cats", "Birds", "Fish & Aquariums", "Pet Accessories", "Pet Care Services", "Other Pets"],
  "Tools & Equipment": ["Power Tools", "Construction Tools", "Cleaning Tools", "Farming Tools", "Medical Equipment"],
  "Education & Learning": ["Tuition", "Competitive Exam Material", "School/College Books", "Skill Courses", "Coaching Classes"],
  "Events & Entertainment": ["Party Supplies", "Costumes", "DJ & Sound Systems", "Lighting Equipment", "Stage Setup"],
  Mobiles: ["Mobile Phones", "Tablets", "Accessories"],
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  interface SpeechRecognition extends EventTarget {
    results: any;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
  }
}

interface ShopData {
  email: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  registration: any;
  user: any,
  shop: any;
  favourites?: any;
}
function AllCategoryRentalForm() {

  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const shopId = "677bccf4e93c318e3075b932";
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};
  
    if (step === 1 && !selectedCategory) {
      newErrors.selectedCategory = "Please select a category.";
    }
  
    if (step === 2 && !selectedSubcategory) {
      newErrors.selectedSubcategory = "Please select a subcategory.";
    }
  
    if (step === 3) {
      if (
        !["Services"].includes(selectedCategory) &&
        !["Services", "Jobs", "Education & Learning"].includes(selectedCategory) &&
        !formData.SaleType
      ) {
        newErrors.SaleType = "Please select Rent or Sale.";
      }
      if (!formData.title || formData.title.trim() === "") {
        newErrors.title = "Title is required.";
      }
      if (!formData.description || formData.title.trim() === "") {
        newErrors.description = "Description is required.";
      }
    }
  
    if (step === 4 && !formData.location?.state) {
      newErrors.location = "Please select your location.";
    }
  
    if (step === 5 && !formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms.";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (nextStep: number, skipValidation = false) => {
    if (!skipValidation && !validateStep(step)) return;
    setStep(nextStep);
  };
  

  useEffect(() => {
    fetch(`/api/getLocalShopById?id=${shopId}`)
      .then((response) => response.json())
      .then((data) => {
        setShop(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching shop:", error);
        setLoading(false);
      });
  }, []);

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
          console.error("Error:", error);
        }
      };

      fetchShopData();
    }
  }, [session]);

  // const shopOwnerID = shopData?.registration?._id;
  const shopOwnerID = shopData?.user?._id;
  console.log("shopOwner_Id", shopData?.user?._id  );


  const [pickupLat, setPickupLat] = useState(null);
  const [pickupLng, setPickupLng] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  
  const handleLocationUpdate = (productId, lat, lng, address) => {
    console.log('Location updated:', { lat, lng, address });
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [step, setStep] = useState(1);

  const handleFormattedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Remove non-numeric characters (₹, commas, etc.)
    const cleaned = rawInput.replace(/[^0-9]/g, ""); // Only digits (no dots, unless you want decimal support)

    // Optional: Convert to number for formatted view
    const numericValue = parseInt(cleaned, 10) || 0;

    // Format to ₹12,34,567 style
    const formatted = formatRupee(numericValue);

    setFormData((prev) => ({
      ...prev,
      formattedPrice: numericValue.toString(),
      SalePrice: formatted, // nicely formatted string for UI
    }));
  };

  const formatRupee = (value: number | string) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, ""); // Only digits

    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };


  const [, setLocationError] = useState("");

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // This is Mic Code
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event: SpeechRecognition) => {
        const transcript = event.results[0][0].transcript;
        setFormData((prev) => ({
          ...prev,
          description: prev.description + " " + transcript,
        }));
      };

      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // End Mic Code

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);


  const [formData, setFormData] = useState({
    title: "",
    SaleType: "",
    description: "",
    subcategory: "",
    feature: false,
    termsAccepted: false,
    rentalType: "",
    category: "",
    condition: "",
    price: "",
    priceWeek: "",
    ownerEmail: session?.user?.contact,
    shopOwnerID: shopOwnerID,
    priceMonth: "",
    brand: "",
    fuel: "",
    BicyclesBrand: "",
    KmDriven: "",
    model: "",
    year: "",
    // location: "",
    location: {
      state: '',
      stateCode: '',
      city: '',
      area: '',
      coordinates: {
        lat: null,
        lng: null
      }
    },
    pickup: {
      address: '',
      coordinates: {
        lat: null,
        lng: null
      }
    },
    SalePrice: "",

    SpareParts: "",
    carBrand: "",
    carModel: "",
    transmission: "",
    OwnersNo: "",

    // Mobile
    MobileBrand: "",
    TabsType: "",
    AccessoriesType: "",
    MobileModel: "",
    // End Mobile

    // Commercial Vehicles
    commercialBrand: "",
    commercialModel: "",
    // Emd Commercial Vehicles

    // Jobs
    salaryPeriod: "",
    positionType: "",
    salaryFrom: "",
    salaryTo: "",
    // End Jobs

    // Apartment
    apartmentType: "",
    bhk: "",
    bathrooms: "",
    furnishing: "",
    listedBy: "",
    superBuiltupArea: "",
    carpetArea: "",
    bachelorsAllowed: "",
    maintenance: "",
    totalFloors: "",
    floorNo: "",
    carParking: "",
    facing: "",
    projectName: "",
    // End Apartment

    // Commercial Property
    CommercialSubtype: "",
    // End Commercial Propert

    // Land & Plots
    landPlotArea: "",
    landLength: "",
    landBreadth: "",
    // End Land & Plot

    // Shops & Office
    ConstructionStatus: "",
    // End Shop & Office

    // PG & Guest House
    mealsIncluded: "",
    pgSubtype: "",
    // End PG & Guest House

    // latitude: null,
    // longitude: null,
    pickupOption: "",
    rentalTermsFile: null,
    coverImage: null as File | null,
    images: [] as File[],
    instagram: "",
    facebook: "",
    twitter: "",
  });


  const [rentalTermsFile, setRentalTermsFile] = useState<File | null>(null);

  const bikeBrands = {
    Honda: ["Activa", "CB Shine", "Hornet", "Dio", "CBR 250R", "Unicorn", "XBlade"],
    Hero: ["Splendor", "HF Deluxe", "Glamour", "Xpulse", "Passion Pro", "Maestro Edge", "Destini 125"],
    Bajaj: ["Pulsar 150", "Pulsar NS200", "CT 100", "Avenger", "Dominar 400", "Platina", "Discover"],
    TVS: ["Apache RTR", "Jupiter", "NTorq", "Star City", "Sport", "XL100", "Raider 125"],
    Yamaha: ["FZ", "R15", "MT-15", "Ray ZR", "Fascino", "SZ-RR", "Fazer"],
    Suzuki: ["Access", "Gixxer", "Burgman", "Intruder", "Hayate", "Let's"],
    RoyalEnfield: ["Classic 350", "Bullet 350", "Meteor", "Himalayan", "Interceptor 650", "Continental GT 650"],
    KTM: ["Duke 200", "Duke 250", "RC 200", "RC 390", "Adventure 390"],
    BMW: ["G 310 R", "G 310 GS", "F 850 GS", "R 1250 GS"],
    Kawasaki: ["Ninja 300", "Ninja 400", "Z650", "Versys 650"],
    HarleyDavidson: ["Street 750", "Iron 883", "Forty-Eight", "Fat Boy"],
    Mahindra: ["Gusto", "Centuro", "Mojo"],
    Aprilia: ["SR 125", "SR 160", "SXR 160"],
    Vespa: ["VXL", "SXL", "ZX", "Elegante"],
    Jawa: ["Jawa", "42", "Perak"],
    Yezdi: ["Roadster", "Scrambler", "Adventure"]
  };
  const carBrands = {
    Maruti: ["Alto", "Swift", "Baleno", "Ertiga", "Dzire", "WagonR", "Brezza", "Celerio"],
    Hyundai: ["i10", "i20", "Creta", "Verna", "Venue", "Aura", "Tucson", "Alcazar"],
    Tata: ["Nexon", "Harrier", "Punch", "Safari", "Tiago", "Tigor", "Altroz"],
    Mahindra: ["Bolero", "Scorpio", "XUV300", "XUV500", "Thar", "XUV700", "KUV100"],
    Honda: ["City", "Amaze", "WR-V", "Jazz", "Civic", "BR-V"],
    Toyota: ["Innova", "Fortuner", "Glanza", "Urban Cruiser", "Etios", "Yaris"],
    Kia: ["Seltos", "Sonet", "Carens", "EV6", "Carnival"],
    Renault: ["Kwid", "Triber", "Kiger", "Duster"],
    Nissan: ["Magnite", "Kicks", "Sunny", "Terrano"],
    Volkswagen: ["Polo", "Vento", "Taigun", "Virtus"],
    Skoda: ["Rapid", "Slavia", "Kushaq", "Octavia"],
    Ford: ["EcoSport", "Figo", "Aspire", "Endeavour"],
    MG: ["Hector", "Astor", "Gloster", "ZS EV"],
    Jeep: ["Compass", "Meridian", "Wrangler"],
    BMW: ["3 Series", "5 Series", "X1", "X5"],
    Audi: ["A4", "A6", "Q3", "Q5", "Q7"],
    Mercedes: ["C-Class", "E-Class", "GLA", "GLC", "GLE"],
  };

  const commercialVehicleBrands = {
    Tata: ["Ace", "Intra", "407", "709", "1512", "Ultra"],
    Mahindra: ["Bolero Pickup", "Jeeto", "Supro", "Furio", "Blazo", "Loadking"],
    AshokLeyland: ["Dost", "Partner", "Boss", "Captain", "Ecomet"],
    Eicher: ["Pro 2049", "Pro 3015", "Pro 1110XP", "Skyline"],
    Piaggio: ["Ape", "Porter", "Quargo"],
    Force: ["Traveller", "Kargo King", "Shaktiman", "Urbania"],
    SMLIsuzu: ["Samrat", "Prestige", "Supreme", "Sartaj"],
    BharatBenz: ["1217C", "2823C", "3528CM", "1015R"],
    Volvo: ["FMX", "FH", "FE", "FL"],
    Scania: ["P Series", "G Series", "R Series", "S Series"]
  };

  const mobileBrands: Record<string, string[]> = {
    Apple: [
      "iPhone 4", "iPhone 4s",
      "iPhone 5", "iPhone 5c", "iPhone 5s",
      "iPhone 6", "iPhone 6 Plus", "iPhone 6s", "iPhone 6s Plus",
      "iPhone SE (1st gen)",
      "iPhone 7", "iPhone 7 Plus",
      "iPhone 8", "iPhone 8 Plus", "iPhone X",
      "iPhone XS", "iPhone XS Max", "iPhone XR",
      "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
      "iPhone SE (2nd gen)",
      "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
      "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
      "iPhone SE (3rd gen)",
      "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
      "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
    ],
    Samsung: [
      "Galaxy S", "Galaxy S II", "Galaxy S III", "Galaxy S4", "Galaxy S5", "Galaxy S6", "Galaxy S6 Edge", "Galaxy S7", "Galaxy S7 Edge",
      "Galaxy S8", "Galaxy S8+", "Galaxy S9", "Galaxy S9+", "Galaxy S10", "Galaxy S10+", "Galaxy S10e",
      "Galaxy S20", "Galaxy S20+", "Galaxy S20 Ultra", "Galaxy S20 FE",
      "Galaxy S21", "Galaxy S21+", "Galaxy S21 Ultra", "Galaxy S21 FE",
      "Galaxy S22", "Galaxy S22+", "Galaxy S22 Ultra",
      "Galaxy S23", "Galaxy S23+", "Galaxy S23 Ultra",
      "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra",
      // A Series (2014+)
      "Galaxy A10", "Galaxy A20", "Galaxy A30", "Galaxy A50", "Galaxy A70", "Galaxy A90", "Galaxy A52", "Galaxy A72", "Galaxy A53", "Galaxy A73",
      // Note Series
      "Galaxy Note", "Galaxy Note II", "Galaxy Note 3", "Galaxy Note 4", "Galaxy Note 5", "Galaxy Note 7", "Galaxy Note 8", "Galaxy Note 9",
      "Galaxy Note 10", "Galaxy Note 10+", "Galaxy Note 20", "Galaxy Note 20 Ultra",
      // Foldables
      "Galaxy Z Fold", "Galaxy Z Fold 2", "Galaxy Z Fold 3", "Galaxy Z Fold 4", "Galaxy Z Fold 5",
      "Galaxy Z Flip", "Galaxy Z Flip 3", "Galaxy Z Flip 4", "Galaxy Z Flip 5",
    ],
    OnePlus: [
      "OnePlus One", "OnePlus 2", "OnePlus X",
      "OnePlus 3", "OnePlus 3T",
      "OnePlus 5", "OnePlus 5T",
      "OnePlus 6", "OnePlus 6T",
      "OnePlus 7", "OnePlus 7 Pro", "OnePlus 7T", "OnePlus 7T Pro",
      "OnePlus 8", "OnePlus 8 Pro", "OnePlus 8T",
      "OnePlus 9", "OnePlus 9 Pro", "OnePlus 9R",
      "OnePlus 10 Pro", "OnePlus 10T",
      "OnePlus 11", "OnePlus 11R",
      "OnePlus 12", "OnePlus 12R",
    ],
    Xiaomi: [
      "Mi 1", "Mi 2", "Mi 3", "Mi 4", "Mi 5", "Mi 6", "Mi 8", "Mi 9", "Mi 10", "Mi 11", "Mi 11X", "Mi 12 Pro",
      "Redmi Note 3", "Redmi Note 4", "Redmi Note 5", "Redmi Note 6 Pro",
      "Redmi Note 7", "Redmi Note 8", "Redmi Note 9", "Redmi Note 10", "Redmi Note 11", "Redmi Note 12", "Redmi Note 13",
      "Poco F1", "Poco F2 Pro", "Poco X2", "Poco X3", "Poco X3 Pro", "Poco F3", "Poco F4", "Poco F5",
    ],
    Realme: [
      "Realme 1", "Realme 2", "Realme 2 Pro", "Realme 3", "Realme 3 Pro", "Realme 5", "Realme 5 Pro",
      "Realme 6", "Realme 6 Pro", "Realme 7", "Realme 7 Pro", "Realme 8", "Realme 8 Pro",
      "Realme 9", "Realme 9 Pro", "Realme GT", "Realme GT Neo", "Realme GT 2 Pro", "Realme GT Neo 3", "Realme 11", "Realme 12",
    ],
    Vivo: [
      "Vivo V9", "Vivo V11 Pro", "Vivo V15 Pro", "Vivo V17 Pro", "Vivo V19", "Vivo V20", "Vivo V21", "Vivo V23", "Vivo V25", "Vivo V27",
      "Vivo X50", "Vivo X60", "Vivo X70", "Vivo X80", "Vivo X90", "Vivo X100",
    ],
    Oppo: [
      "Oppo F1", "Oppo F3", "Oppo F5", "Oppo F7", "Oppo F9", "Oppo F11", "Oppo F15", "Oppo F17", "Oppo F19", "Oppo F21", "Oppo F25",
      "Oppo Reno", "Oppo Reno 2", "Oppo Reno 3", "Oppo Reno 4", "Oppo Reno 5", "Oppo Reno 6", "Oppo Reno 7", "Oppo Reno 8", "Oppo Reno 9", "Oppo Reno 10",
      "Oppo Find X", "Oppo Find X2", "Oppo Find X3", "Oppo Find X5", "Oppo Find X6",
    ],
    Motorola: [
      "Moto G", "Moto G2", "Moto G3", "Moto G4", "Moto G5", "Moto G6", "Moto G7", "Moto G8", "Moto G9", "Moto G10", "Moto G20", "Moto G30", "Moto G40", "Moto G60",
      "Moto Edge", "Moto Edge 20", "Moto Edge 30", "Moto Edge 40",
      "Moto Razr", "Moto Razr 5G", "Moto Razr 40",
    ],
    Nokia: [
      "Nokia Lumia 800", "Nokia Lumia 920", "Nokia Lumia 1020",
      "Nokia 3", "Nokia 5", "Nokia 6", "Nokia 7 Plus", "Nokia 8",
      "Nokia 5.4", "Nokia G20", "Nokia X20", "Nokia X30",
    ],
    Sony: [
      "Xperia Z", "Xperia Z1", "Xperia Z2", "Xperia Z3", "Xperia Z5",
      "Xperia XZ", "Xperia XZ1", "Xperia XZ2", "Xperia XZ3",
      "Xperia 1", "Xperia 5", "Xperia 10", "Xperia 1 II", "Xperia 1 III", "Xperia 1 IV", "Xperia 1 V",
    ],
    Huawei: [
      "Huawei P8", "Huawei P9", "Huawei P10", "Huawei P20", "Huawei P30", "Huawei P40", "Huawei P50", "Huawei P60",
      "Mate 8", "Mate 9", "Mate 10", "Mate 20", "Mate 30", "Mate 40", "Mate 50", "Mate 60",
      "Nova 5", "Nova 7", "Nova 8", "Nova 9", "Nova 10", "Nova 11",
    ],
    Google: [
      "Pixel", "Pixel XL",
      "Pixel 2", "Pixel 2 XL",
      "Pixel 3", "Pixel 3 XL",
      "Pixel 3a", "Pixel 3a XL",
      "Pixel 4", "Pixel 4 XL",
      "Pixel 4a", "Pixel 4a 5G",
      "Pixel 5", "Pixel 5a",
      "Pixel 6", "Pixel 6 Pro", "Pixel 6a",
      "Pixel 7", "Pixel 7 Pro", "Pixel 7a",
      "Pixel 8", "Pixel 8 Pro", "Pixel 8a",
    ],
    Nothing: ["Phone (1)", "Phone (2)"],
    Others: ["Other Model"],
  };
  

  // Handler
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  // console.log("Is terms accepted?", formData.termsAccepted);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImages = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: updatedImages }));
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      updatedImages.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }));
    }
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: null }));
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     // Validate SaleType
     const newErrors: { [key: string]: string } = {};
    // ✅ Skip SaleType & price validation for these categories
    const skipSaleTypeValidation = ["jobs", "services", "education & learning"].includes(selectedCategory?.toLowerCase() || "");

    // ✅ SaleType validation
    if (!skipSaleTypeValidation && !formData.SaleType) {
      newErrors.SaleType = "Please select Rent or Sale.";
    }

    // ✅ Rent validations
    if (!skipSaleTypeValidation && formData.SaleType === "Rent") {
      if (!formData.rentalType) {
        newErrors.rentalType = "Please select a rental type.";
      }

      if (formData.rentalType === "daily" && !formData.price) {
        newErrors.price = "Please enter price per day.";
      }

      if (formData.rentalType === "weekly" && !formData.priceWeek) {
        newErrors.priceWeek = "Please enter price per week.";
      }

      if (formData.rentalType === "monthly" && !formData.priceMonth) {
        newErrors.priceMonth = "Please enter price per month.";
      }
    }

// ✅ Sale validations
if (!skipSaleTypeValidation && formData.SaleType === "Sale" && !formData.SalePrice) {
  newErrors.SalePrice = "Please enter sale price.";
}

// ✅ Terms
if (!formData.termsAccepted) {
  newErrors.termsAccepted = "You must accept the terms.";
}
     setErrors(newErrors);
   
     // ❌ Stop submission if errors exist
     if (Object.keys(newErrors).length > 0) {
       return;
     }

    const payload = new FormData();

    payload.append("category", selectedCategory);
    payload.append("SaleType", formData.SaleType);
    payload.append("subcategory", selectedSubcategory);
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("rentalType", formData.rentalType);
    payload.append("state", formData.location.state);
    payload.append("stateCode", formData.location.stateCode);
    payload.append("city", formData.location.city);
    payload.append("area", formData.location.area);
    payload.append("latitude", formData.location?.coordinates?.lat?.toString() || "");
    payload.append("longitude", formData.location?.coordinates?.lng?.toString() || "");
    // Add pickup location data
    payload.append("pickupAddress", formData.pickup.address || "");
    payload.append("pickupLat", formData.pickup.coordinates.lat?.toString() || "");
    payload.append("pickupLng", formData.pickup.coordinates.lng?.toString() || "");

    payload.append("ownerEmail", session?.user?.contact || "nothing");
    payload.append("shopOwnerID", shopOwnerID || "nothing");
    payload.append("price", formData.price);
    payload.append("priceWeek", formData.priceWeek);
    payload.append("priceMonth", formData.priceMonth);
    payload.append("SalePrice", formData.SalePrice);
    payload.append("condition", formData.condition);
    payload.append("termsAccepted", formData.termsAccepted.toString());
    payload.append("instagram", formData.instagram);
    payload.append("facebook", formData.facebook);
    payload.append("twitter", formData.twitter);
    payload.append("feature", formData.feature ? "true" : "false");
    payload.append("pickupOption", formData.pickupOption);

    if (formData.rentalTermsFile) {
      payload.append("rentalTermsFile", formData.rentalTermsFile);
    }

    if (formData.coverImage) {
      payload.append("coverImage", formData.coverImage);
    }

    formData.images.forEach((img) => payload.append("images", img));

    if (selectedCategory === "Car") {
      switch (selectedSubcategory) {
        case "Cars":
          payload.append("carModel", formData.carModel || "");
          payload.append("carBrand", formData.carBrand || "");
          payload.append("transmission", formData.transmission || "");
          payload.append("OwnersNo", formData.OwnersNo || "");
          payload.append("fuel", formData.fuel || "");
          payload.append("KmDriven", formData.KmDriven || "");
          payload.append("year", formData.year || "");
          break;

        default:
          break;
      }
    }
    // Commercial Vehicles
    if (selectedCategory === "Commercial Vehicles") {
      payload.append("commercialBrand", formData.commercialBrand || "");
      payload.append("commercialModel", formData.commercialModel || "");
      payload.append("year", formData.year || "");
      payload.append("fuel", formData.fuel || "");
      payload.append("transmission", formData.transmission || "");
      payload.append("OwnersNo", formData.OwnersNo || "");
      payload.append("KmDriven", formData.KmDriven || "");
    }
    // End Commercial Vehicles

    // Vehicles
    if (selectedCategory === "Vehicles") {
      switch (selectedSubcategory) {
        case "Motorcycles":
        case "Scooters":
          payload.append("brand", formData.brand || "");
          payload.append("model", formData.model || "");
          payload.append("year", formData.year || "");
          payload.append("fuel", formData.fuel || "");
          payload.append("OwnersNo", formData.OwnersNo || "");
          payload.append("KmDriven", formData.KmDriven || "");
          break;

        case "Bicycles":
          payload.append("BicyclesBrand", formData.BicyclesBrand);
          break;

        default:
          break;
      }
    }
    // End Vehicles

    if (selectedSubcategory === "Spare Parts") {
      payload.append("SpareParts", formData.SpareParts || "");
    }

    if (selectedCategory === "Jobs") {
      payload.append("salaryPeriod", formData.salaryPeriod || "");
      payload.append("positionType", formData.positionType || "");
      payload.append("salaryFrom", formData.salaryFrom || "");
      payload.append("salaryTo", formData.salaryTo || "");
    }

    if (selectedCategory === "Real Estate") {
      switch (selectedSubcategory) {
        case "Shops & Offices":
          payload.append("furnishing", formData.furnishing);
          payload.append("listedBy", formData.listedBy);
          payload.append("superBuiltupArea", formData.superBuiltupArea);
          payload.append("carpetArea", formData.carpetArea);
          payload.append("maintenance", formData.maintenance);
          payload.append("carParking", formData.carParking);
          payload.append("projectName", formData.projectName);
          payload.append("ConstructionStatus", formData.ConstructionStatus);
          break;

        case "House & Apartments":
          payload.append("apartmentType", formData.apartmentType);
          payload.append("bhk", formData.bhk);
          payload.append("bathrooms", formData.bathrooms);
          payload.append("furnishing", formData.furnishing);
          payload.append("listedBy", formData.listedBy);
          payload.append("superBuiltupArea", formData.superBuiltupArea);
          payload.append("carpetArea", formData.carpetArea);
          payload.append("maintenance", formData.maintenance);
          payload.append("totalFloors", formData.totalFloors);
          payload.append("floorNo", formData.floorNo);
          payload.append("carParking", formData.carParking);
          payload.append("facing", formData.facing);
          payload.append("bachelorsAllowed", formData.bachelorsAllowed);
          payload.append("projectName", formData.projectName);
          payload.append("ConstructionStatus", formData.ConstructionStatus);
          break;

        case "Commercial Properties":
          payload.append("CommercialSubtype", formData.CommercialSubtype || "");
          payload.append("listedBy", formData.listedBy);
          payload.append("furnishing", formData.furnishing);
          payload.append("carParking", formData.carParking);
          payload.append("superBuiltupArea", formData.superBuiltupArea);
          payload.append("carpetArea", formData.carpetArea);
          payload.append("maintenance", formData.maintenance);
          payload.append("ConstructionStatus", formData.ConstructionStatus);
          payload.append("projectName", formData.projectName);
          break;

        case "PG & Guest House":
          payload.append("pgSubtype", formData.pgSubtype);
          payload.append("mealsIncluded", formData.mealsIncluded);
          payload.append("furnishing", formData.furnishing);
          payload.append("carParking", formData.carParking);
          payload.append("bachelorsAllowed", formData.bachelorsAllowed);
          payload.append("listedBy", formData.listedBy);
          break;

        case "Land & Plots":
          payload.append("listedBy", formData.listedBy);
          payload.append("landPlotArea", formData.landPlotArea);
          payload.append("landLength", formData.landLength);
          payload.append("landBreadth", formData.landBreadth);
          payload.append("facing", formData.facing);
          payload.append("projectName", formData.projectName);
          break;

        default:
          break;
      }
    }

    if (selectedCategory === "Mobiles") {

      switch (selectedSubcategory) {
        case "Mobile Phones":
          if (formData.MobileBrand) {
            payload.append("MobileBrand", formData.MobileBrand);
            payload.append("MobileModel", formData.MobileModel);
          }
          break;

        case "Tablets":
          if (formData.TabsType) {
            payload.append("TabsType", formData.TabsType);
          }
          break;

        case "Accessories":
          if (formData.AccessoriesType) {
            payload.append("AccessoriesType", formData.AccessoriesType);
          }
          break;

        default:
          break;
      }
    }



    try {
      const res = await fetch("/api/products/add", {
        method: "POST",
        body: payload,
      });

      if (res.status === 403) {
        const data = await res.json();
        Swal.fire({
          title: "Limit Reached",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Upgrade Now",
        }).then(() => {
          window.location.href = data.redirectUrl || "/payment";
        });
      
        return;
      }
      
      const result = await res.json();
      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: "Product Posted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          title: "Oops!",
          text: "Failed to add product.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
      // alert(result.success ? "Product added successfully!" : "Failed to add product.");
      // if (result.success) window.location.reload();
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting the form.");
    }
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
  };

  return (
    <>
    <Head>
        <title>Post Your Product – OnShoper</title>
        <meta
          name="description"
          content="Create a new listing on OnShoper. Sell or rent your products and services with ease."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />

        {/* Optional: Social Sharing */}
        <meta property="og:title" content="Post Your Product – OnShoper" />
        <meta property="og:description" content="Sell or rent your items on OnShoper. Reach thousands of buyers instantly." />
        <meta property="og:image" content="/images/og-product-form.jpg" />
        <meta property="og:url" content="https://onshoper.com/product/create" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h2>Post Your: <span className={styles.SelectedItem}>{selectedCategory} {">"} {selectedSubcategory}</span></h2>

      {step === 1 && (
        <div className={styles.slideIn}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setStep(2); }}>
              <option value="">Select Category</option>
              {Object.keys(categories).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.slideIn}>
          <div className={styles.formGroup}>
            <label>Subcategory</label>
            <select value={selectedSubcategory} onChange={(e) => { setSelectedSubcategory(e.target.value); setStep(3); }}>
              <option value="">Select Subcategory</option>
              {categories[selectedCategory]?.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
          <center><button type="button" className={styles.backButton} onClick={() => goToStep(1, true)}>← Back</button></center>
        </div>
      )}

      {step === 3 && (
        <div className={styles.slideIn}>
          {!["Services"].includes(selectedSubcategory) &&
            !["Services", "Jobs", "Education & Learning"].includes(selectedCategory) && (
              <>
              <div className={styles.formGroup}>
                <label>Type</label>
                <div className={styles.SaleType}>
                  <label> <input type="radio" name="SaleType" value="Rent" checked={formData.SaleType === "Rent"} onChange={handleChange} />Rent</label>
                  <label><input type="radio" name="SaleType" value="Sale" checked={formData.SaleType === "Sale"} onChange={handleChange} />Sale</label>
                </div>
                {!["Jobs", "Services", "Education & Learning"].includes(selectedCategory) &&
                  errors.SaleType && (
                    <p className={styles.errorText}>{errors.SaleType}</p>
                )}
              </div>
              </>
            )}
          
          
          {/* Start Parts-Type */}
          {selectedSubcategory === "Spare Parts" && (
            <div className={styles.FormChildGroup}>
              <div className={styles.formGroup}>
                <label>Spare Parts-Type</label>
                <select name="SpareParts" value={formData.SpareParts}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      SpareParts: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Type</option>
                  <option value="Wheels & Tyres">Wheels & Tyres</option>
                  <option value="Audio Accessories">Audio Accessories</option>
                  <option value="Lighting & Electricals">Lighting & Electricals</option>
                  <option value="Mirrors & Glasses">Mirrors & Glasses</option>
                  <option value="Body Parts">Body Parts</option>
                  <option value="Brakes & Suspension">Brakes & Suspension</option>
                  <option value="Engine Components">Engine Components</option>
                  <option value="Transmission Systems">Transmission Systems</option>
                  <option value="Cooling Systems">Cooling Systems</option>
                  <option value="Other Spare Parts">Other Spare Parts</option>
                </select>
              </div>
            </div>
          )}
          {/* End Parts-Type */}


          {/* Commercial Vehicles  */}
          {selectedCategory === "Commercial Vehicles" && (
            <>
              <div className={styles.FormChildGroup}>
                <div className={styles.formGroup}>
                  <label>Commercial Vehicle Brand</label>
                  <select name="commercialBrand" value={formData.commercialBrand}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        commercialBrand: e.target.value,
                        commercialModel: "", // reset model when brand changes
                      }));
                    }}
                  >
                    <option value="">Select Brand</option>
                    {Object.keys(commercialVehicleBrands).map((brand) => (
                      <option key={brand} value={brand}>
                        {brand.replace("commercial", "")} {/* Show cleaner brand label */}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.commercialBrand && (
                  <div className={styles.formGroup}>
                    <label>Commercial Vehicle Model</label>
                    <select name="commercialModel" value={formData.commercialModel}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          commercialModel: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Model</option>
                      {commercialVehicleBrands[formData.commercialBrand].map((model) => (
                        <option key={model} value={model}>
                          {model.replace("commercial", "")} {/* Show cleaner model label */}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Year</label>
                <input type="number" name="year" value={formData.year || ""} onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === "") {
                    handleChange(e);
                    return;
                  }
                  const year = Number(inputValue);
                  const currentYear = new Date().getFullYear();

                  // Allow typing any 4-digit number but validate range
                  if (inputValue.length <= 4) {
                    if (year >= 1900 && year <= currentYear) {
                      handleChange(e);
                    } else {
                      // Allow typing in progress even if it's not yet valid (like '2' or '202')
                      handleChange(e);
                    }
                  }
                }}
                  placeholder=""
                  inputMode="numeric"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Fuel Type</label>
                <select name="fuel" value={formData.fuel || ""} onChange={handleChange}>
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Transmission</label>
                <select name="transmission" value={formData.transmission || ""} onChange={handleChange}>
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Number of Owners</label>
                <select name="OwnersNo" value={formData.OwnersNo || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4+">4th or more</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>KM Driven</label>
                <input type="number" name="KmDriven" value={formData.KmDriven || ""} onChange={handleChange} placeholder=".."/>
              </div>
            </>
          )}
          {/* End Commercial Vehicles */}

          {/* Jobs */}
          {selectedCategory === "Jobs" && (
            <>
              <div className={styles.FormCol2}>
                <div className={styles.formGroup}>
                  <label>Salary Period</label>
                  <select value={formData.salaryPeriod} onChange={(e) => setFormData({ ...formData, salaryPeriod: e.target.value })} >
                    <option value="">Select Salary Period</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Position Type</label>
                  <select value={formData.positionType} onChange={(e) => setFormData({ ...formData, positionType: e.target.value })}>
                    <option value="">Select Position Type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              </div>

              <div className={styles.SalaryFromTo}>
                <div className={styles.formGroup}>
                  <label>Salary From</label>
                  <input type="text" placeholder="Enter minimum salary" value={formatRupee(formData.salaryFrom)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salaryFrom: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Salary To</label>
                  <input type="text" placeholder="Enter maximum salary" value={formatRupee(formData.salaryTo)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salaryTo: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                </div>
              </div>

            </>
          )}

          {/* End Jobs */}

          {/* Tablets */}
          {selectedSubcategory === "Tablets" && (
            <div className={styles.formGroup}>
              <label>Type</label>
              <select name="TabsType" value={formData.TabsType || ""}
                onChange={handleChange}>
                <option value="">Select Subtype</option>
                <option value="Ipads">Ipads</option>
                <option value="Samsung">Samsung</option>
                <option value="Other Tablets">Other Tablets</option>
              </select>
            </div>
          )}
          {/* End Tablets */}

          {/* Mobile Accessories */}
          {selectedSubcategory === "Accessories" && (
            <div className={styles.formGroup}>
              <label>Accessories Type</label>
              <select value={formData.AccessoriesType} onChange={(e) => setFormData({ ...formData, AccessoriesType: e.target.value })}>
                <option value="">Select Type</option>
                <option value="Ipads">Ipads</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>

          )}
          {/* End Mobile Accessories */}

          {/* Mobiles */}
          {selectedSubcategory === "Mobile Phones" && (
            <div className={styles.FormChildGroup}>
              <div className={styles.formGroup}>
                <label>Mobile Brand</label>
                <select name="MobileBrand" value={formData.MobileBrand} onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      MobileBrand: e.target.value,
                      MobileModel: "", // reset model when brand changes
                    }));
                  }}>
                  <option value="">Select Brand</option>
                  {Object.keys(mobileBrands).map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {formData.MobileBrand && (
                <div className={styles.formGroup}>
                  <label>Mobile Model</label>
                  <select name="MobileModel" value={formData.MobileModel || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        MobileModel: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Model</option>
                    {mobileBrands[formData.MobileBrand].map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* End Mobiles */}

          {selectedSubcategory === "Commercial Properties" && (
            <>
              <div className={styles.FormCol2}>
                <div className={styles.formGroup}>
                  <label>Subtype</label>
                  <select name="CommercialSubtype" value={formData.CommercialSubtype || ""}
                    onChange={handleChange}>
                    <option value="">Select Subtype</option>
                    <option value="Office">Office</option>
                    <option value="Shop">Shop</option>
                    <option value="Showroom">Showroom</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Furnishings</label>
                  <select name="furnishing" value={formData.furnishing || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Construction Status</label>
                  <select name="ConstructionStatus" value={formData.ConstructionStatus || ""} onChange={handleChange}>
                    <option value="">Select Status</option>
                    <option value="New Launch">New Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Under Construction">Under Construction</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Listed By</label>
                  <select name="listedBy" value={formData.listedBy || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Owner">Owner</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Builder">Builder</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Car Parking</label>
                  <select name="carParking" value={formData.carParking || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Super Built-up Area (sqft)</label>
                  <input type="number" name="superBuiltupArea" value={formData.superBuiltupArea || ""} onChange={handleChange} placeholder="e.g. 1200"/>
                </div>

                <div className={styles.formGroup}>
                  <label>Carpet Area (sqft)</label>
                  <input type="number" name="carpetArea" value={formData.carpetArea || ""} onChange={handleChange} placeholder="e.g. 900"/>
                </div>
                <div className={styles.formGroup}>
                  <label>Maintenance (Monthly)</label>
                  <input type="number" name="maintenance" value={formData.maintenance || ""} onChange={handleChange} placeholder="₹/month"/>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input type="text" name="projectName" value={formData.projectName || ""} onChange={handleChange} placeholder="Enter project/society name"/>
              </div>
            </>
          )}
          {selectedSubcategory === "Shops & Offices" && (
            <>
              <div className={styles.FormCol2}>
                <div className={styles.formGroup}>
                  <label>Furnishings</label>
                  <select name="furnishing" value={formData.furnishing || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Construction Status</label>
                  <select name="ConstructionStatus" value={formData.ConstructionStatus || ""} onChange={handleChange}>
                    <option value="">Select Status</option>
                    <option value="New Launch">New Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Under Construction">Under Construction</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Listed By</label>
                  <select name="listedBy" value={formData.listedBy || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Owner">Owner</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Builder">Builder</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Car Parking</label>
                  <select name="carParking" value={formData.carParking || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Super Built-up Area (sqft)</label>
                  <input type="number" name="superBuiltupArea" value={formData.superBuiltupArea || ""} onChange={handleChange} placeholder="e.g. 1200"/>
                </div>

                <div className={styles.formGroup}>
                  <label>Carpet Area (sqft)</label>
                  <input type="number" name="carpetArea" value={formData.carpetArea || ""} onChange={handleChange} placeholder="e.g. 900"/>
                </div>
                <div className={styles.formGroup}>
                  <label>Maintenance (Monthly)</label>
                  <input type="number" name="maintenance" value={formData.maintenance || ""} onChange={handleChange} placeholder="₹/month"/>
                </div>
                <div className={styles.formGroup}>
                  <label>Project Name</label>
                  <input type="text" name="projectName" value={formData.projectName || ""} onChange={handleChange} placeholder="Enter project/society name"/>
                </div>
              </div>

            </>
          )}

          {/* Start PG & Gust House */}
          {selectedSubcategory === "PG & Guest House" && (
            <>
              <div className={styles.formGroup}>
                <label>Meals Included</label>
                <div className={styles.SaleType}>
                  <label><input type="radio" name="mealsIncluded" value="Yes" checked={formData.mealsIncluded === "Yes"} onChange={handleChange} />Yes</label>
                  <label><input type="radio" name="mealsIncluded" value="No" checked={formData.mealsIncluded === "No"} onChange={handleChange} />No</label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Subtype</label>
                <select name="pgSubtype" value={formData.pgSubtype || ""} onChange={handleChange}>
                  <option value="">Select Subtype</option>
                  <option value="PG">PG</option>
                  <option value="Guest House">Guest House</option>
                  <option value="Roommate">Roommate</option>
                </select>
              </div>
              <div className={styles.FormCol2}>
                <div className={styles.formGroup}>
                  <label>Listed By</label>
                  <select name="listedBy" value={formData.listedBy || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Owner">Owner</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Builder">Builder</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Furnishings</label>
                  <select name="furnishing" value={formData.furnishing || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Bachelors Allowed</label>
                  <select name="bachelorsAllowed" value={formData.bachelorsAllowed || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Car Parking</label>
                  <select name="carParking" value={formData.carParking || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* End PG & Gust House */}


          {/* Ploat and Lands */}
          {selectedSubcategory === "Land & Plots" && (
            <>
              <div className={styles.FormCol2}>
                <div className={styles.formGroup}>
                  <label>Listed By</label>
                  <select name="listedBy" value={formData.listedBy || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Owner">Owner</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Builder">Builder</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Plot Area (sqft)</label>
                  <input type="number" name="landPlotArea" value={formData.landPlotArea || ""} onChange={handleChange} placeholder="e.g. 1200"/>
                </div>

                <div className={styles.formGroup}>
                  <label>Length (ft)</label>
                  <input type="number" name="landLength" value={formData.landLength || ""} onChange={handleChange} placeholder="e.g. 40"/>
                </div>

                <div className={styles.formGroup}>
                  <label>Breadth (ft)</label>
                  <input type="number" name="landBreadth" value={formData.landBreadth || ""} onChange={handleChange} placeholder="e.g. 30"/>
                </div>
                <div className={styles.formGroup}>
                  <label>Facing</label>
                  <select name="facing" value={formData.facing || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Project Name</label>
                  <input type="text" name="projectName" value={formData.projectName || ""} onChange={handleChange} placeholder="Enter project/society name"/>
                </div>
              </div>
            </>
          )}

          {/* End Ploats and Lands */}


          {/* Apartment */}
          {selectedSubcategory === "House & Apartments" && (
            <>
              <div className={styles.FormCol2}>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select name="apartmentType" value={formData.apartmentType || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Farm House">Farm House</option>
                    <option value="House & Villas">House & Villas</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>BHK</label>
                  <select name="bhk" value={formData.bhk || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="5+ BHK">5+ BHK</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms || ""} onChange={handleChange} placeholder="Enter number of bathrooms"/>
                </div>

                <div className={styles.formGroup}>
                  <label>Furnishings</label>
                  <select name="furnishing" value={formData.furnishing || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Listed By</label>
                  <select name="listedBy" value={formData.listedBy || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Owner">Owner</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Builder">Builder</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Super Built-up Area (sqft)</label>
                  <input type="number" name="superBuiltupArea" value={formData.superBuiltupArea || ""} onChange={handleChange} placeholder="e.g. 1200"/>
                </div>

                <div className={styles.formGroup}>
                  <label>Carpet Area (sqft)</label>
                  <input type="number" name="carpetArea" value={formData.carpetArea || ""} onChange={handleChange} placeholder="e.g. 900"/>
                </div>

                {formData.SaleType !== "Sale" && (
                  <div className={styles.formGroup}>
                    <label>Bachelors Allowed</label>
                    <select name="bachelorsAllowed" value={formData.bachelorsAllowed || ""} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>Maintenance (Monthly)</label>
                  <input type="number" name="maintenance" value={formData.maintenance || ""} onChange={handleChange} placeholder="₹/month"/>
                </div>

                <div className={styles.formGroup}>
                  <label>Total Floors</label>
                  <select name="totalFloors" value={formData.totalFloors || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>



                <div className={styles.formGroup}>
                  <label>Floor No.</label>
                  <select name="floorNo" value={formData.floorNo || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>



                <div className={styles.formGroup}>
                  <label>Car Parking</label>
                  <select name="carParking" value={formData.carParking || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Facing</label>
                  <select name="facing" value={formData.facing || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>


                <div className={styles.formGroup}>
                  <label>Construction Status</label>
                  <select name="ConstructionStatus" value={formData.ConstructionStatus || ""} onChange={handleChange}>
                    <option value="">Select Status</option>
                    <option value="New Launch">New Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Under Construction">Under Construction</option>
                  </select>
                </div>


              </div>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input type="text" name="projectName" value={formData.projectName || ""} onChange={handleChange} placeholder="Enter project/society name"/>
              </div>
            </>
          )}

          {/* End Apartment */}

          {/* Start Cars */}
          {["Cars"].includes(selectedSubcategory) && (
            <>
              <div className={styles.FormChildGroup}>
                <div className={styles.formGroup}>
                  <label>Car Brand</label>
                  <select name="carBrand" value={formData.carBrand} onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      carBrand: e.target.value,
                      carModel: "", // reset model when brand changes
                    }));
                  }}
                  >
                    <option value="">Select Brand</option>
                    {Object.keys(carBrands).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {formData.carBrand && (
                  <div className={styles.formGroup}>
                    <label>Car Model</label>
                    <select name="carModel" value={formData.carModel} onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        carModel: e.target.value,
                      }))
                    }
                    >
                      <option value="">Select Model</option>
                      {carBrands[formData.carBrand].map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Year</label>
                <input type="number" name="year" value={formData.year || ""} onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === "") {
                    handleChange(e);
                    return;
                  }
                  const year = Number(inputValue);
                  const currentYear = new Date().getFullYear();

                  // Allow typing any 4-digit number but validate range
                  if (inputValue.length <= 4) {
                    if (year >= 1900 && year <= currentYear) {
                      handleChange(e);
                    } else {
                      // Allow typing in progress even if it's not yet valid (like '2' or '202')
                      handleChange(e);
                    }
                  }
                }}
                  placeholder=""
                  inputMode="numeric"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Fuel Type</label>
                <select name="fuel" value={formData.fuel || ""} onChange={handleChange}>
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Transmission</label>
                <select name="transmission" value={formData.transmission || ""} onChange={handleChange}>
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Number of Owners</label>
                <select name="OwnersNo" value={formData.OwnersNo || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4+">4th or more</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>KM Driven</label>
                <input type="number" name="KmDriven" value={formData.KmDriven || ""} onChange={handleChange} placeholder=".."/>
              </div>
            </>
          )}

          {/* Start Bikes and Scooters */}
          {["Motorcycles", "Scooters"].includes(selectedSubcategory) && (
            <>
              <div className={styles.FormChildGroup}>
                <div className={styles.formGroup}>
                  <label>Bike Brand</label>
                  <select name="brand" value={formData.brand}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        brand: e.target.value,
                        model: "", // reset model when brand changes
                      }));
                    }}
                  >
                    <option value="">Select Brand</option>
                    {Object.keys(bikeBrands).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                {formData.brand && (
                  <div className={styles.formGroup}>
                    <label>Bike Model</label>
                    <select name="model" value={formData.model} onChange={handleChange}>
                      <option value="">Select Model</option>
                      {bikeBrands[formData.brand].map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Fuel Type</label>
                <select name="fuel" value={formData.fuel || ""} onChange={handleChange}>
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>KM Driven</label>
                <input type="number" name="KmDriven" value={formData.KmDriven || ""} onChange={handleChange} placeholder=".."/>
              </div>
              <div className={styles.formGroup}>
                <label>Number of Owners</label>
                <select name="OwnersNo" value={formData.OwnersNo || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4+">4th or more</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Year</label>
                <input type="number" name="year" value={formData.year || ""} onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === "") {
                    handleChange(e);
                    return;
                  }
                  const year = Number(inputValue);
                  const currentYear = new Date().getFullYear();

                  // Allow typing any 4-digit number but validate range
                  if (inputValue.length <= 4) {
                    if (year >= 1900 && year <= currentYear) {
                      handleChange(e);
                    } else {
                      // Allow typing in progress even if it's not yet valid (like '2' or '202')
                      handleChange(e);
                    }
                  }
                }}
                  placeholder=""
                  inputMode="numeric"
                />
              </div>

            </>
          )}

          {/* Start Bicycles */}
          {["Bicycles"].includes(selectedSubcategory) && (
            <>
              <div className={styles.formGroup}>
                <label>Brand</label>
                <select name="BicyclesBrand" value={formData.BicyclesBrand} onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      BicyclesBrand: e.target.value,
                    }));
                  }}>
                  <option value="">Select Brand</option>
                  <option value="Hero">Hero</option>
                  <option value="Hercules">Hercules</option>
                  <option value="BSA">BSA</option>
                  <option value="Avon">Avon</option>
                  <option value="Firefox">Firefox</option>
                  <option value="Btwin">Btwin</option>
                  <option value="Montra">Montra</option>
                  <option value="Mach City">Mach City</option>
                  <option value="Giant">Giant</option>
                  <option value="Trek">Trek</option>
                  <option value="Scott">Scott</option>
                  <option value="Cannondale">Cannondale</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Specialized">Specialized</option>
                  <option value="Merida">Merida</option>
                  <option value="LA Sovereign">LA Sovereign</option>
                  <option value="Ninety One">Ninety One</option>
                  <option value="Schnell">Schnell</option>
                </select>
              </div>
            </>
          )}
          {/* End {/* Start Bicycles */}

          {!["House & Apartments", "Land & Plots", "PG & Guest House", "Shops & Offices", "Commercial Properties"].includes(selectedSubcategory) && (
            !["Services", "Jobs", "Pets & Pet Care", "Education & Learning", "Events & Entertainment"].includes(selectedCategory) &&
            <div className={styles.formGroup}>
              <label>Condition</label>
              <div className={styles.radioGroup}>
                <label><input type="radio" name="condition" value="New" checked={formData.condition === "New"} onChange={handleChange} />New</label>
                <label><input type="radio" name="condition" value="Good" checked={formData.condition === "Good"} onChange={handleChange} />Good</label>
                <label><input type="radio" name="condition" value="Fair" checked={formData.condition === "Fair"} onChange={handleChange} />Fair</label>
              </div>
            </div>
          )}
          {!["House & Apartments", "Cars", "Motorcycles", "Land & Plots", "PG & Guest House", "Shops & Offices", "Commercial Properties"].includes(selectedSubcategory) && (
            !["Services", "Jobs", "Education & Learning", "Commercial Vehicles", "Events & Entertainment"].includes(selectedCategory) &&
            <div className={styles.formGroup}>
              <label>Select Pickup Option</label>
              <div className={styles.pickupOptions}>
                <label className={`${styles.radioCard} ${formData.pickupOption === "Owner Delivery" ? styles.selected : ""}`}>
                  <input type="radio" name="pickupOption" value="Owner Delivery" checked={formData.pickupOption === "Owner Delivery"}
                    onChange={handleChange} />
                  <div>
                    <strong>Owner Delivery</strong>
                    <p>Owner will deliver the item to your location.</p>
                  </div>
                </label>

                <label className={`${styles.radioCard} ${formData.pickupOption === "User Pickup" ? styles.selected : ""}`}>
                  <input type="radio" name="pickupOption" value="User Pickup" checked={formData.pickupOption === "User Pickup"} onChange={handleChange}/>
                  <div>
                    <strong>User Pickup</strong>
                    <p>User has to visit and pick up the item.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Pickup Option */}
          {/* <div className={styles.formGroup}>
            <label htmlFor="pickupOption">Pickup Option</label>
            <select
              id="pickupOption"
              name="pickupOption"
              value={formData.pickupOption}
              onChange={handleChange}
              required
            >
              <option value="">Select Option</option>
              <option value="Owner Delivery">Owner Delivery</option>
              <option value="User Pickup">User Pickup</option>
            </select>
          </div> */}




         

          {/* <div className={styles.flexRow}>
            <div className={styles.formGroup}><label>Price Per Day (₹)</label><input name="price" type="number" value={formData.price} onChange={handleChange} /></div>
            <div className={styles.formGroup}><label>Price Per Week (₹)</label><input name="priceWeek" type="number" value={formData.priceWeek} onChange={handleChange} /></div>
            <div className={styles.formGroup}><label>Price Per Month (₹)</label><input name="priceMonth" type="number" value={formData.priceMonth} onChange={handleChange} /></div>
          </div> */}
          <div className={styles.formGroup}>
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            <span className={styles.subText}>Make your title clear and specific so buyers can quickly know  about your product.</span>
            {errors.title && <p className={styles.errorText}>{errors.title}</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <div style={{ position: "relative" }}>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} style={{ paddingRight: "40px" }} />
              <button type="button" onClick={toggleListening} style={{
                position: "absolute", right: "8px", top: "8px", background: listening ? "#f00" : "#ddd",
                color: "#fff", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer",
              }} title={listening ? "Stop Recording" : "Start Recording"}>🎤
              </button>
            </div>
            <span className={styles.subText}>{errors.description && <p className={styles.errorText}>{errors.description}</p>} Describe your product and key features, or tap the mic to speak.</span>
          </div>



          
          <div className={styles.fileManageWrap}>
            <div className={styles.formGroup}>
              <label>Cover Image</label>
              <input type="file" accept="image/*" onChange={handleCoverImageChange} ref={coverImageInputRef} />
              {formData.coverImage && (
                <div className={styles.imagePreviewBox}>
                  <img src={URL.createObjectURL(formData.coverImage)} alt="Cover Preview" />
                  <button type="button" className={styles.removeImage} onClick={handleRemoveCoverImage}>&times;</button>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Upload Images</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
              <div className={`${styles.imagePreviewWrapper} ${styles.SpaceBox}`}>
                {formData.images.map((img, idx) => (
                  <div key={idx} className={`${styles.imagePreviewBox} ${styles.NewPreviewBox}`}>
                    <img src={URL.createObjectURL(img)} alt={`Preview ${idx}`} />
                    <button type="button" className={styles.removeImage} onClick={() => handleRemoveImage(idx)}>&times;</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Rental Terms File Upload */}
          
          </div>
          {!["Jobs", "Education & Learning"].includes(selectedCategory) && (
            <>
              {formData.SaleType !== "Sale" && (
                <div className={styles.formGroup}>
                  <label htmlFor="rentalTermsFile">Upload Terms (PDF/Image)</label>
                  <input type="file" id="rentalTermsFile" name="rentalTermsFile" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, "rentalTermsFile")} />
                </div>
              )}
            </>
          )}

          <div className={styles.socialLink}>
            <div className={styles.formGroup}>
              <label className="icon-instagram">
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialVisitLink} title="Open Instagram">Instagram Link</Link>
              </label>
              <input type="url" name="instagram" placeholder="https://instagram.com/yourprofile" value={formData.instagram} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label className="icon-facebook">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialVisitLink} title="Open Facebook">Facebook Link</a>
              </label>
              <input type="url" name="facebook" placeholder="https://facebook.com/yourprofile" value={formData.facebook} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label className="icon-twitter">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialVisitLink} title="Open Twitter">Twitter Link</a>
              </label>
              <input type="url" name="twitter" placeholder="https://twitter.com/yourprofile" value={formData.twitter} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.BtnFlex}>
            <button type="button" className={styles.backButton} onClick={() => goToStep(2, true)}>← Back</button>
            <button type="button" className={styles.backButton} onClick={() => goToStep(4)}>Next →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className={styles.formGroup}>
        <IndiaAddressForm onLocationSelect={handleLocationSelect} isProductForm={true} formData={formData} setFormData={setFormData}/>
        {errors.location && <p className={styles.errorText}>{errors.location}</p>}
        {/* <label><span className="icon-map-pin"></span>Enter Your Location</label> */}
        {/* <PickupLocationSearch
              setLat={(lat: any) => setFormData(prev => ({...prev, pickup: { ...prev.pickup, coordinates: { ...prev.pickup.coordinates, lat: lat}}}))}
              setLng={(lng: any) => setFormData(prev => ({...prev, pickup: { ...prev.pickup, coordinates: { ...prev.pickup.coordinates, lng: lng}}}))}
              setAddress={(address) => setFormData(prev => ({...prev, pickup: {...prev.pickup, address: address}}))}
              onLocationUpdate={handleLocationUpdate}/> */}

        {/* {pickupAddress && (
          <div className="selected-location">
            <p><strong>Selected Location:</strong> {pickupAddress}</p>
          </div>
        )} */}

        <div className={styles.BtnFlex}>
          <button type="button" className={styles.backButton} onClick={() => goToStep(3, true)}>← Back</button>
          <button type="button" className={styles.backButton} onClick={() => goToStep(5)}>Next →</button>
        </div>
      </div>
      )}

      {step === 5 && (
      <>
        <div className={styles.slideIn}>
            {!["Jobs"].includes(selectedCategory) && (
              <>
                {formData.SaleType !== "Sale" && (
                  <>
                  <div className={styles.FormChildGroup}>
                    <div className={styles.formGroup}>
                      <label>Price Type</label>
                      <select name="rentalType" value={formData.rentalType} onChange={handleChange} className={styles.selectInput}>
                        <option value="">Select Rental Type</option>
                        <option value="daily">Per Day</option>
                        <option value="weekly">Per Week</option>
                        <option value="monthly">Per Month</option>
                      </select>
                    </div>
                    {formData.rentalType === "daily" && (
                      <div className={styles.formGroup}>
                        <label>Price Per Day (₹)</label>
                        <input name="price" type="text" value={formatRupee(formData.price || "")} onChange={handlePriceChange} />
                      </div>
                    )}
                    {formData.rentalType === "weekly" && (
                      <div className={styles.formGroup}>
                        <label>Price Per Week (₹)</label>
                        <input name="priceWeek" type="text" value={formatRupee(formData.priceWeek || "")} onChange={handlePriceChange} />
                      </div>
                    )}
                    {formData.rentalType === "monthly" && (
                      <div className={styles.formGroup}>
                        <label>Price Per Month (₹)</label>
                        <input name="priceMonth" type="text" value={formatRupee(formData.priceMonth || "")} onChange={handlePriceChange} />
                      </div>
                    )}
                  </div>
                  {!["jobs", "services", "education & learning"].includes(selectedCategory) &&
                    errors.rentalType && (
                      <p className={styles.errorText}>{errors.rentalType}</p>
                  )}

                  </>
                )}
                {!["Education & Learning", "Services"].includes(selectedCategory) && (
                  <>
                    {formData.SaleType !== "Rent" && (
                      <div className={styles.formGroup}>
                        <label>Enter Price </label>
                        <input type="text" name="formattedPrice" value={formData.SalePrice} onChange={handleFormattedPriceChange}/>
                        {!["jobs", "services", "education & learning"].includes(selectedCategory) &&
                          errors.SalePrice && (
                            <p className={styles.errorText}>{errors.SalePrice}</p>
                        )}

                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <div className={styles.BtnFlex}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }))} required />I agree to the <button type="button" className={styles.linkButton} onClick={() => setShowTerms(true)}>Terms and Conditions</button>
              </label>
              <button type="button" className={styles.backButton} onClick={() => goToStep(4, true)}>← Back</button>
            </div>
          <div className={styles.buttonGroup}><button type="submit" className={styles.submitButton}>Post Ad</button></div>   
        </div>
      </>
      )}

      {showTerms && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Terms and Conditions</h3>
            <ul>
              <li>You must provide accurate and truthful information about the product.</li>
              <li>You confirm that you are the rightful owner or authorized to rent this item.</li>
              <li>Prohibited items (e.g. weapons, illegal goods) are not allowed.</li>
              <li>Uploaded images can be displayed on our platform.</li>
              <li>We are not responsible for any disputes or damages arising from the transaction.</li>
              <li>You agree to comply with our content guidelines.</li>
              <li>We reserve the right to remove listings violating our policies.</li>
              <li>By submitting this ad, you agree to the processing of your data according to our Privacy Policy.</li>
            </ul>
            <button onClick={() => setShowTerms(false)} className={styles.closeBtn}>Close</button>
          </div>
        </div>
      )}
    </form>
    </>
  );
}
export default withProtectedPage(AllCategoryRentalForm);
