(function (global) {
  "use strict";

  const STORAGE_KEYS = {
    LISTINGS: "campusnest_lk_listings_v1",
    SAVED: "campusnest_lk_saved_v1",
    COMPARE: "campusnest_lk_compare_v1",
    INQUIRIES: "campusnest_lk_inquiries_v1"
  };

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore storage quota errors gracefully
    }
  }

  function createInitialState() {
    const storedListings = readStorage(STORAGE_KEYS.LISTINGS, null);
    const listings = Array.isArray(storedListings) && storedListings.length > 0
      ? storedListings
      : global.CampusNestData.INITIAL_LISTINGS.slice();

    const savedIds = readStorage(STORAGE_KEYS.SAVED, ["cn-101", "cn-105"]);
    const compareIds = readStorage(STORAGE_KEYS.COMPARE, []);
    const inquiries = readStorage(STORAGE_KEYS.INQUIRIES, []);

    return {
      listings: listings,
      savedIds: Array.isArray(savedIds) ? savedIds : [],
      compareIds: Array.isArray(compareIds) ? compareIds.slice(0, 3) : [],
      inquiries: Array.isArray(inquiries) ? inquiries : [],
      filters: {
        university: "all",
        rentRange: "all",
        roomType: "all",
        gender: "all",
        keyword: "",
        sort: "featured",
        chips: {
          verified: false,
          availableNow: false,
          wifi: false,
          attachedBath: false,
          kitchenOrMeals: false
        }
      },
      activeDetailsId: null,
      activePhotoIndex: 0
    };
  }

  const state = createInitialState();

  function persistAll() {
    writeStorage(STORAGE_KEYS.LISTINGS, state.listings);
    writeStorage(STORAGE_KEYS.SAVED, state.savedIds);
    writeStorage(STORAGE_KEYS.COMPARE, state.compareIds);
    writeStorage(STORAGE_KEYS.INQUIRIES, state.inquiries);
  }

  function getFilteredListings() {
    const f = state.filters;
    const kw = f.keyword.trim().toLowerCase();

    const filtered = state.listings.filter(function (item) {
      if (f.university !== "all" && item.university !== f.university) return false;
      if (f.roomType !== "all" && item.roomType !== f.roomType) return false;
      if (f.gender !== "all" && item.gender !== f.gender) return false;

      if (f.rentRange !== "all") {
        const parts = f.rentRange.split("-").map(Number);
        const min = parts[0];
        const max = parts[1];
        if (item.rent < min || item.rent > max) return false;
      }

      if (f.chips.verified && !item.verified) return false;
      if (f.chips.availableNow && item.availability !== "Available Now") return false;
      if (f.chips.wifi && !item.amenities.includes("wifi")) return false;
      if (f.chips.attachedBath && !item.amenities.includes("attachedBath")) return false;
      if (
        f.chips.kitchenOrMeals &&
        !item.amenities.includes("kitchen") &&
        !item.amenities.includes("meals")
      ) {
        return false;
      }

      if (kw) {
        const haystack = [
          item.title,
          item.university,
          item.area,
          item.walkTime,
          item.busRoute,
          item.roomType,
          item.gender,
          item.description,
          item.ownerName,
          item.amenities.join(" ")
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }

      return true;
    });

    const sorted = filtered.slice();
    sorted.sort(function (a, b) {
      switch (f.sort) {
        case "rent-asc":
          return a.rent - b.rent;
        case "rent-desc":
          return b.rent - a.rent;
        case "distance-asc":
          return a.distanceMeters - b.distanceMeters;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "featured":
        default:
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }

  function hasActiveFilters() {
    const f = state.filters;
    return (
      f.university !== "all" ||
      f.rentRange !== "all" ||
      f.roomType !== "all" ||
      f.gender !== "all" ||
      f.keyword.trim() !== "" ||
      Object.values(f.chips).some(Boolean)
    );
  }

  function resetFilters() {
    state.filters.university = "all";
    state.filters.rentRange = "all";
    state.filters.roomType = "all";
    state.filters.gender = "all";
    state.filters.keyword = "";
    state.filters.sort = "featured";
    Object.keys(state.filters.chips).forEach(function (k) {
      state.filters.chips[k] = false;
    });
  }

  function toggleSaved(id) {
    const idx = state.savedIds.indexOf(id);
    let added = false;
    if (idx === -1) {
      state.savedIds.unshift(id);
      added = true;
    } else {
      state.savedIds.splice(idx, 1);
    }
    persistAll();
    return added;
  }

  function toggleCompare(id) {
    const idx = state.compareIds.indexOf(id);
    if (idx !== -1) {
      state.compareIds.splice(idx, 1);
      persistAll();
      return { status: "removed" };
    }
    if (state.compareIds.length >= 3) {
      return { status: "limit" };
    }
    state.compareIds.push(id);
    persistAll();
    return { status: "added" };
  }

  function clearCompare() {
    state.compareIds = [];
    persistAll();
  }

  function addListing(newListing) {
    state.listings.unshift(newListing);
    persistAll();
  }

  function addInquiry(inquiry) {
    state.inquiries.unshift(inquiry);
    persistAll();
  }

  function resetDemoData() {
    state.listings = global.CampusNestData.INITIAL_LISTINGS.slice();
    state.savedIds = ["cn-101", "cn-105"];
    state.compareIds = [];
    state.inquiries = [];
    resetFilters();
    persistAll();
  }

  function getListingById(id) {
    return state.listings.find(function (item) {
      return item.id === id;
    });
  }

  global.CampusNestState = {
    state: state,
    getFilteredListings: getFilteredListings,
    hasActiveFilters: hasActiveFilters,
    resetFilters: resetFilters,
    toggleSaved: toggleSaved,
    toggleCompare: toggleCompare,
    clearCompare: clearCompare,
    addListing: addListing,
    addInquiry: addInquiry,
    resetDemoData: resetDemoData,
    getListingById: getListingById
  };
})(window);
