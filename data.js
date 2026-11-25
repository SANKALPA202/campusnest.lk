(function (global) {
  "use strict";

  const UNIVERSITIES = [
    { id: "University of Moratuwa", short: "UoM Moratuwa", city: "Katubedda" },
    { id: "University of Colombo", short: "UoC Colombo", city: "Colombo 07" },
    { id: "University of Peradeniya", short: "UoP Peradeniya", city: "Peradeniya" },
    { id: "University of Kelaniya", short: "UoK Kelaniya", city: "Dalugama" },
    { id: "SLIIT", short: "SLIIT Malabe", city: "Malabe" },
    { id: "NSBM", short: "NSBM Homagama", city: "Pitipana" },
    { id: "University of Sri Jayewardenepura", short: "USJ Nugegoda", city: "Wijerama" }
  ];

  const AMENITIES = [
    { id: "wifi", label: "High-Speed Wi-Fi", short: "Wi-Fi" },
    { id: "meals", label: "Home-Cooked Meals Option", short: "Meals" },
    { id: "kitchen", label: "Shared / Private Kitchen", short: "Kitchen Access" },
    { id: "desk", label: "Study Desk & Chair", short: "Study Desk" },
    { id: "attachedBath", label: "Attached Bathroom", short: "Attached Bath" },
    { id: "parking", label: "Bike / Car Parking", short: "Parking" },
    { id: "laundry", label: "Washing Machine", short: "Laundry" },
    { id: "security", label: "CCTV & Gated Entry", short: "CCTV Security" },
    { id: "fan", label: "Ceiling Fan / Cross-Breeze", short: "Ceiling Fan" }
  ];

  const PHOTO_PRESETS = {
    single: [
      "assets/images/single-room.jpg",
      "assets/images/boarding-exterior.jpg",
      "assets/images/student-annex.jpg"
    ],
    shared: [
      "assets/images/shared-room.jpg",
      "assets/images/boarding-exterior.jpg",
      "assets/images/single-room.jpg"
    ],
    annex: [
      "assets/images/student-annex.jpg",
      "assets/images/single-room.jpg",
      "assets/images/boarding-exterior.jpg"
    ],
    exterior: [
      "assets/images/boarding-exterior.jpg",
      "assets/images/single-room.jpg",
      "assets/images/shared-room.jpg"
    ]
  };

  const INITIAL_LISTINGS = [
    {
      id: "cn-101",
      title: "Calm Single Study Room near UoM Katubedda Gate",
      university: "University of Moratuwa",
      area: "Bandaranayake Mawatha, Katubedda",
      distanceMeters: 350,
      walkTime: "4 min walk to Main Gate",
      busRoute: "Bus 100 / 101 Galle Rd (300m to Katubedda Junction)",
      rent: 17500,
      deposit: 17500,
      roomType: "Single",
      gender: "Boys Only",
      availability: "Available Now",
      verified: true,
      amenities: ["wifi", "desk", "attachedBath", "parking", "security", "fan"],
      billsNote: "Water & Fiber Wi-Fi included; separate sub-meter for room electricity",
      curfew: "11:00 PM main gate lock (prior message allowed for late lab work)",
      visitors: "Parents & fellow UoM students permitted in common veranda until 7:00 PM",
      description:
        "Quiet upstairs single room built specifically for engineering undergraduates. Features a solid mahogany study desk, ergonomic chair, bookshelf, good cross-ventilation, and covered motorbike parking.",
      ownerName: "Mr. Nimal Perera",
      ownerPhone: "077 452 8891",
      ownerSince: "Hosting UoM students since 2018",
      photos: [
        "assets/images/single-room.jpg",
        "assets/images/student-annex.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-22T09:00:00Z"
    },
    {
      id: "cn-102",
      title: "Safe Girls Boarding with Meals — Reid Avenue Walk",
      university: "University of Colombo",
      area: "Thurstan Road Lane, Colombo 07",
      distanceMeters: 520,
      walkTime: "6 min walk to UoC Arts / Science Gate",
      busRoute: "Bus 138 / 154 / 120 within 250m",
      rent: 22500,
      deposit: 22500,
      roomType: "Shared",
      gender: "Girls Only",
      availability: "2 Beds Left",
      verified: true,
      amenities: ["wifi", "meals", "kitchen", "desk", "laundry", "security", "fan"],
      billsNote: "Electricity, water, and SLT Fiber Wi-Fi included in monthly rent",
      curfew: "9:30 PM gate closing; weekend home-visit log maintained",
      visitors: "Female friends & parents welcome in reception lounge 8:00 AM – 6:30 PM",
      description:
        "Well-supervised two-sharing room in a peaceful residential lane behind Cinnamon Gardens. Home-cooked breakfast and dinner available on request, plus shared pantry with fridge and kettle.",
      ownerName: "Mrs. Kusum Jayawardena",
      ownerPhone: "071 884 3022",
      ownerSince: "Verified host since 2017",
      photos: [
        "assets/images/shared-room.jpg",
        "assets/images/single-room.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-21T14:30:00Z"
    },
    {
      id: "cn-103",
      title: "Private Student Annex — Galaha Road, Peradeniya",
      university: "University of Peradeniya",
      area: "Galaha Road, Near Hindagala Junction",
      distanceMeters: 680,
      walkTime: "8 min walk to Galaha Junction / Engineering Faculty",
      busRoute: "Campus shuttle & Bus 652 Kandy–Peradeniya every 10 mins",
      rent: 21000,
      deposit: 30000,
      roomType: "Annex",
      gender: "Boys Only",
      availability: "Available Now",
      verified: true,
      amenities: ["wifi", "kitchen", "desk", "attachedBath", "parking", "fan"],
      billsNote: "Water included; independent CEB electricity meter",
      curfew: "No strict curfew — private entrance key provided",
      visitors: "Daytime study group visits allowed till 8:00 PM",
      description:
        "Self-contained ground-floor annex surrounded by cool greenery. Ideal for final-year students or pairs wanting privacy, a dedicated kitchenette counter, attached tiled bathroom, and zero noise.",
      ownerName: "Mr. Roshan Bandara",
      ownerPhone: "077 912 6405",
      ownerSince: "Verified host since 2020",
      photos: [
        "assets/images/student-annex.jpg",
        "assets/images/student-annex.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-20T11:15:00Z"
    },
    {
      id: "cn-104",
      title: "Bright Shared Room near Dalugama Gate, Kelaniya",
      university: "University of Kelaniya",
      area: "Kandy Road, Dalugama (Opposite Temple Lane)",
      distanceMeters: 280,
      walkTime: "3 min walk to Main Gate",
      busRoute: "Bus 138 / 154 / 200 Kandy Rd at doorstep",
      rent: 12500,
      deposit: 12500,
      roomType: "Shared",
      gender: "Girls Only",
      availability: "Available Now",
      verified: true,
      amenities: ["wifi", "kitchen", "desk", "security", "fan"],
      billsNote: "All utility bills & Wi-Fi included (fair usage for electric kettles)",
      curfew: "9:45 PM gate lock with matron on premises",
      visitors: "Parents & immediate family only in common sitting room",
      description:
        "Affordable, clean twin-sharing room just steps away from the Kelaniya Main Gate. Includes individual lockable wardrobes, study tables, filtered drinking water, and 24/7 CCTV coverage.",
      ownerName: "Mrs. Malini Wijeratne",
      ownerPhone: "076 318 9940",
      ownerSince: "Hosting UoK students since 2019",
      photos: [
        "assets/images/shared-room.jpg",
        "assets/images/boarding-exterior.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-24T08:20:00Z"
    },
    {
      id: "cn-105",
      title: "Modern SLIIT Malabe Single Room + Balcony Study Nook",
      university: "SLIIT",
      area: "Gemunupura, New Kandy Road, Malabe",
      distanceMeters: 450,
      walkTime: "5 min walk to SLIIT Main Gate",
      busRoute: "Bus 177 / 190 / 993 Malabe Town (3 mins)",
      rent: 24000,
      deposit: 24000,
      roomType: "Single",
      gender: "Mixed",
      availability: "1 Bed Left",
      verified: true,
      amenities: ["wifi", "kitchen", "desk", "attachedBath", "parking", "laundry", "security", "fan"],
      billsNote: "100 Mbps Fiber Wi-Fi & water free; electricity split by room meter",
      curfew: "11:30 PM main gate (24/7 card access for internship students)",
      visitors: "Guests allowed in ground-floor lobby until 7:30 PM with ID sign-in",
      description:
        "Separate-wing modern boarding facility popular with SLIIT IT and Engineering students. High-speed symmetrical Wi-Fi for remote lectures, balcony study nook, and washing machine access.",
      ownerName: "Mr. Chaminda Silva",
      ownerPhone: "077 205 4418",
      ownerSince: "Verified host since 2021",
      photos: [
        "assets/images/student-annex.jpg",
        "assets/images/single-room.jpg",
        "assets/images/student-annex.jpg"
      ],
      createdAt: "2026-11-25T06:45:00Z"
    },
    {
      id: "cn-106",
      title: "NSBM Pitipana Twin Room — Shuttle & Bike Parking",
      university: "NSBM",
      area: "Mahenawaththa, Pitipana North, Homagama",
      distanceMeters: 750,
      walkTime: "9 min walk to NSBM Green University Gate",
      busRoute: "NSBM student shuttle & Bus 129 / 293 Pitipana",
      rent: 14000,
      deposit: 14000,
      roomType: "Shared",
      gender: "Boys Only",
      availability: "Available Now",
      verified: true,
      amenities: ["wifi", "kitchen", "desk", "parking", "laundry", "security", "fan"],
      billsNote: "Water & Wi-Fi included; electricity shared equally (~LKR 1,200/mo)",
      curfew: "11:00 PM gate closing; late entry with prior call",
      visitors: "Daytime visitors allowed in veranda till 6:30 PM",
      description:
        "Spacious newly tiled boarding house in quiet Pitipana North. Each student gets a full-size desk, reading lamp, wardrobe, and access to a shared kitchen with rice cooker and refrigerator.",
      ownerName: "Mr. Tharindu Rathnayake",
      ownerPhone: "070 441 7723",
      ownerSince: "Verified host since 2022",
      photos: [
        "assets/images/shared-room.jpg",
        "assets/images/boarding-exterior.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-23T12:10:00Z"
    },
    {
      id: "cn-107",
      title: "Private Ladies Studio Annex — Wijerama Junction",
      university: "University of Sri Jayewardenepura",
      area: "Soratha Mawatha, Wijerama, Nugegoda",
      distanceMeters: 400,
      walkTime: "5 min walk to USJ Main Gate",
      busRoute: "Bus 138 High Level Rd (350m away)",
      rent: 26500,
      deposit: 50000,
      roomType: "Annex",
      gender: "Girls Only",
      availability: "From Next Month",
      verified: true,
      amenities: ["wifi", "kitchen", "desk", "attachedBath", "laundry", "security", "fan"],
      billsNote: "Water included; separate CEB meter & optional Dialog Fiber",
      curfew: "10:00 PM outer gate (private annex door with safety grille)",
      visitors: "Female friends & family welcome anytime until 7:00 PM",
      description:
        "Independent upstairs annex ideal for two close friends or a single postgraduate student. Features pantry sink, mini-fridge space, private balcony clothes-drying rack, and CCTV perimeter.",
      ownerName: "Mrs. Dilhani Fernando",
      ownerPhone: "077 653 1904",
      ownerSince: "Verified host since 2019",
      photos: [
        "assets/images/student-annex.jpg",
        "assets/images/single-room.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-19T16:00:00Z"
    },
    {
      id: "cn-108",
      title: "Budget-Friendly Moratuwa Bodim — Molpe Road",
      university: "University of Moratuwa",
      area: "Molpe Road, Katubedda (Near Back Gate)",
      distanceMeters: 600,
      walkTime: "7 min walk to UoM Back Gate",
      busRoute: "Bus 158 / 255 Mt. Lavinia–Piliyandala",
      rent: 11500,
      deposit: 11500,
      roomType: "Shared",
      gender: "Boys Only",
      availability: "2 Beds Left",
      verified: false,
      amenities: ["wifi", "meals", "desk", "parking", "fan"],
      billsNote: "Water & Wi-Fi included; electricity ~LKR 900/person monthly",
      curfew: "11:00 PM gate lock",
      visitors: "Students from UoM allowed till 7:00 PM",
      description:
        "Clean budget twin room close to UoM Back Gate and affordable rice-and-curry bath kade spots. Quiet neighborhood with friendly landlord family downstairs.",
      ownerName: "Mr. Anura Senanayake",
      ownerPhone: "075 820 3319",
      ownerSince: "Joined Nov 2026",
      photos: [
        "assets/images/boarding-exterior.jpg",
        "assets/images/shared-room.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-18T10:00:00Z"
    },
    {
      id: "cn-109",
      title: "Quiet Single Room with Meals — Near SLIIT Back Lane",
      university: "SLIIT",
      area: "Pothuarawa Road, Malabe",
      distanceMeters: 920,
      walkTime: "10 min walk / 3 min tuk to SLIIT",
      busRoute: "Bus 177 / 17 Kandy–Panadura via Malabe",
      rent: 19500,
      deposit: 19500,
      roomType: "Single",
      gender: "Girls Only",
      availability: "Available Now",
      verified: true,
      amenities: ["wifi", "meals", "desk", "attachedBath", "security", "fan"],
      billsNote: "Wi-Fi, water & electricity included in rent (no AC)",
      curfew: "10:00 PM main gate",
      visitors: "Parents & female guests allowed in sitting area",
      description:
        "Peaceful single room in a gated residential garden. Ideal for students who prefer a quiet study routine with optional Sri Lankan home-cooked dinner and attached bathroom.",
      ownerName: "Mrs. Priyanthi De Silva",
      ownerPhone: "071 509 7462",
      ownerSince: "Verified host since 2020",
      photos: [
        "assets/images/single-room.jpg",
        "assets/images/boarding-exterior.jpg",
        "assets/images/boarding-exterior.jpg"
      ],
      createdAt: "2026-11-24T17:40:00Z"
    }
  ];

  global.CampusNestData = {
    UNIVERSITIES: UNIVERSITIES,
    AMENITIES: AMENITIES,
    PHOTO_PRESETS: PHOTO_PRESETS,
    INITIAL_LISTINGS: INITIAL_LISTINGS
  };
})(window);
