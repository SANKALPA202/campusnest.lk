(function (global) {
  "use strict";

  const { PHOTO_PRESETS } = global.CampusNestData;
  const stateApi = global.CampusNestState;
  const ui = global.CampusNestUI;

  let uploadedDataUrl = "";

  function refreshAll() {
    ui.syncFilterInputs(stateApi.state);
    ui.renderListings();
    ui.renderBadgesAndTray();
    if (!document.getElementById("savedDrawerBackdrop").classList.contains("hidden")) {
      ui.renderSavedDrawer();
    }
    if (!document.getElementById("compareModalBackdrop").classList.contains("hidden")) {
      ui.renderComparisonModal();
    }
    if (
      stateApi.state.activeDetailsId &&
      !document.getElementById("detailsModalBackdrop").classList.contains("hidden")
    ) {
      ui.renderDetailsModal(stateApi.state.activeDetailsId);
    }
  }

  function openBackdrop(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("hidden");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeBackdrop(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
    const anyOpen = document.querySelector(".modal-backdrop:not(.hidden), .drawer-backdrop:not(.hidden)");
    if (!anyOpen) {
      document.body.style.overflow = "";
    }
  }

  function closeAllModals() {
    [
      "savedDrawerBackdrop",
      "detailsModalBackdrop",
      "compareModalBackdrop",
      "postAdModalBackdrop",
      "inquiryModalBackdrop"
    ].forEach(closeBackdrop);
  }

  function openDetails(id) {
    stateApi.state.activeDetailsId = id;
    stateApi.state.activePhotoIndex = 0;
    ui.renderDetailsModal(id);
    openBackdrop("detailsModalBackdrop");
  }

  function openSavedDrawer() {
    ui.renderSavedDrawer();
    openBackdrop("savedDrawerBackdrop");
  }

  function openCompareModal() {
    ui.renderComparisonModal();
    openBackdrop("compareModalBackdrop");
  }

  function openPostAdModal() {
    clearPostAdErrors();
    openBackdrop("postAdModalBackdrop");
  }

  function openInquiryModal(id) {
    clearInquiryErrors();
    ui.renderInquiryModal(id);
    openBackdrop("inquiryModalBackdrop");
  }

  function isValidSriLankanPhone(phone) {
    const digits = String(phone || "").replace(/[\s\-()]/g, "");
    return /^(07\d{8}|\+947\d{8}|947\d{8})$/.test(digits);
  }

  function clearPostAdErrors() {
    const summary = document.getElementById("postAdErrorSummary");
    if (summary) {
      summary.classList.add("hidden");
      summary.textContent = "";
    }
    document.querySelectorAll("[data-error-for]").forEach(function (el) {
      el.textContent = "";
    });
    document.querySelectorAll("#postAdForm .input-invalid").forEach(function (el) {
      el.classList.remove("input-invalid");
    });
  }

  function setPostAdError(field, message, inputEl) {
    const errEl = document.querySelector('[data-error-for="' + field + '"]');
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.classList.add("input-invalid");
  }

  function clearInquiryErrors() {
    document.querySelectorAll("[data-inq-error]").forEach(function (el) {
      el.textContent = "";
    });
    document.querySelectorAll("#inquiryForm .input-invalid").forEach(function (el) {
      el.classList.remove("input-invalid");
    });
  }

  function handlePostAdSubmit(e) {
    e.preventDefault();
    clearPostAdErrors();

    const form = e.target;
    const title = form.title.value.trim();
    const university = form.university.value;
    const distanceMeters = Number(form.distanceMeters.value);
    const area = form.area.value.trim();
    const busRoute = form.busRoute.value.trim();
    const rent = Number(form.rent.value);
    const deposit = form.deposit.value === "" ? NaN : Number(form.deposit.value);
    const availability = form.availability.value;
    const roomType = form.roomType.value;
    const gender = form.gender.value;
    const billsNote = form.billsNote.value.trim();
    const curfew = form.curfew.value.trim();
    const visitors = form.visitors.value.trim();
    const description = form.description.value.trim();
    const ownerName = form.ownerName.value.trim();
    const phone = form.phone.value.trim();
    const photoPreset = form.photoPreset.value;

    const checkedAmenities = Array.from(
      form.querySelectorAll('input[name="amenities"]:checked')
    ).map(function (cb) {
      return cb.value;
    });

    const errors = [];
    if (title.length < 8) {
      setPostAdError("title", "Enter a clear title (at least 8 characters).", form.title);
      errors.push("title");
    }
    if (!university) {
      setPostAdError("university", "Please choose the nearest university.", form.university);
      errors.push("university");
    }
    if (!distanceMeters || distanceMeters < 50 || distanceMeters > 15000) {
      setPostAdError("distanceMeters", "Enter distance between 50m and 15,000m.", form.distanceMeters);
      errors.push("distanceMeters");
    }
    if (area.length < 4) {
      setPostAdError("area", "Enter road, area, or gate landmark.", form.area);
      errors.push("area");
    }
    if (!rent || rent < 4000 || rent > 150000) {
      setPostAdError("rent", "Enter monthly rent between LKR 4,000 and 150,000.", form.rent);
      errors.push("rent");
    }
    if (Number.isNaN(deposit) || deposit < 0 || deposit > 300000) {
      setPostAdError("deposit", "Enter key money deposit (0 or higher in LKR).", form.deposit);
      errors.push("deposit");
    }
    if (!roomType) {
      setPostAdError("roomType", "Select a room type.", form.roomType);
      errors.push("roomType");
    }
    if (!gender) {
      setPostAdError("gender", "Select gender preference.", form.gender);
      errors.push("gender");
    }
    if (checkedAmenities.length === 0) {
      setPostAdError("amenities", "Select at least one amenity available at the property.", null);
      errors.push("amenities");
    }
    if (description.length < 20) {
      setPostAdError("description", "Write at least 20 characters describing the room and surroundings.", form.description);
      errors.push("description");
    }
    if (ownerName.length < 3) {
      setPostAdError("ownerName", "Enter the landlord or owner's name.", form.ownerName);
      errors.push("ownerName");
    }
    if (!isValidSriLankanPhone(phone)) {
      setPostAdError("phone", "Enter a valid Sri Lankan mobile (e.g. 077 452 8891 or +94 77...).", form.phone);
      errors.push("phone");
    }

    if (errors.length > 0) {
      const summary = document.getElementById("postAdErrorSummary");
      if (summary) {
        summary.textContent = "Please fix the " + errors.length + " highlighted field(s) before publishing your boarding ad.";
        summary.classList.remove("hidden");
      }
      const firstInvalid = form.querySelector(".input-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const walkMins = Math.max(1, Math.round(distanceMeters / 80));
    const presetGallery = PHOTO_PRESETS[photoPreset] || PHOTO_PRESETS.single;
    const photos = uploadedDataUrl ? [uploadedDataUrl].concat(presetGallery.slice(0, 2)) : presetGallery.slice();

    const newListing = {
      id: "cn-" + Date.now(),
      title: title,
      university: university,
      area: area,
      distanceMeters: distanceMeters,
      walkTime: walkMins + " min walk to Campus Gate",
      busRoute: busRoute || "Local bus route nearby",
      rent: rent,
      deposit: deposit,
      roomType: roomType,
      gender: gender,
      availability: availability,
      verified: false,
      amenities: checkedAmenities,
      billsNote: billsNote || "Confirm electricity & water policy with owner",
      curfew: curfew || "10:30 PM gate closing",
      visitors: visitors || "Daytime visitors allowed with prior notice",
      description: description,
      ownerName: ownerName,
      ownerPhone: phone,
      ownerSince: "Newly listed owner",
      photos: photos,
      createdAt: new Date().toISOString()
    };

    stateApi.addListing(newListing);
    stateApi.resetFilters();
    stateApi.state.filters.sort = "newest";
    form.reset();
    uploadedDataUrl = "";
    closeBackdrop("postAdModalBackdrop");
    refreshAll();
    ui.showToast("Boarding listing published! Now live in the directory.");

    const listingsEl = document.getElementById("listingsSection");
    if (listingsEl) listingsEl.scrollIntoView({ behavior: "smooth" });
  }

  function handleInquirySubmit(e) {
    e.preventDefault();
    clearInquiryErrors();

    const listingId = document.getElementById("inquiryListingId").value;
    const nameEl = document.getElementById("inqStudentName");
    const phoneEl = document.getElementById("inqStudentPhone");
    const moveInEl = document.getElementById("inqMoveIn");
    const facultyEl = document.getElementById("inqFaculty");
    const msgEl = document.getElementById("inqMessage");

    let valid = true;
    if (nameEl.value.trim().length < 2) {
      document.querySelector('[data-inq-error="studentName"]').textContent = "Enter your name.";
      nameEl.classList.add("input-invalid");
      valid = false;
    }
    if (!isValidSriLankanPhone(phoneEl.value.trim())) {
      document.querySelector('[data-inq-error="studentPhone"]').textContent = "Enter valid SL mobile (07X XXX XXXX).";
      phoneEl.classList.add("input-invalid");
      valid = false;
    }
    if (!moveInEl.value) {
      document.querySelector('[data-inq-error="moveIn"]').textContent = "Select expected move-in date.";
      moveInEl.classList.add("input-invalid");
      valid = false;
    }
    if (msgEl.value.trim().length < 10) {
      document.querySelector('[data-inq-error="message"]').textContent = "Enter a short message (min 10 chars).";
      msgEl.classList.add("input-invalid");
      valid = false;
    }

    if (!valid) return;

    const item = stateApi.getListingById(listingId);
    stateApi.addInquiry({
      id: "inq-" + Date.now(),
      listingId: listingId,
      listingTitle: item ? item.title : "",
      studentName: nameEl.value.trim(),
      studentPhone: phoneEl.value.trim(),
      moveIn: moveInEl.value,
      faculty: facultyEl.value.trim(),
      message: msgEl.value.trim(),
      sentAt: new Date().toISOString()
    });

    e.target.reset();
    closeBackdrop("inquiryModalBackdrop");
    ui.showToast("Inquiry sent to " + (item ? item.ownerName : "owner") + "! They will call or WhatsApp you.");
  }

  function bindEvents() {
    // Hero Search Form
    const heroForm = document.getElementById("heroSearchForm");
    if (heroForm) {
      heroForm.addEventListener("submit", function (e) {
        e.preventDefault();
        stateApi.state.filters.university = document.getElementById("heroUniversity").value;
        stateApi.state.filters.rentRange = document.getElementById("heroRentRange").value;
        stateApi.state.filters.roomType = document.getElementById("heroRoomType").value;
        stateApi.state.filters.gender = document.getElementById("heroGender").value;
        refreshAll();
        document.getElementById("listingsSection").scrollIntoView({ behavior: "smooth" });
      });
    }

    ["heroResetBtn", "clearAllFiltersBtn", "emptyResetBtn"].forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", function () {
          stateApi.resetFilters();
          refreshAll();
          ui.showToast("All search filters cleared.");
        });
      }
    });

    // Synced Filter Controls
    const filterBindings = [
      { id: "filterUniversity", key: "university" },
      { id: "filterRentRange", key: "rentRange" },
      { id: "filterRoomType", key: "roomType" },
      { id: "filterGender", key: "gender" },
      { id: "sortSelect", key: "sort" }
    ];
    filterBindings.forEach(function (b) {
      const el = document.getElementById(b.id);
      if (el) {
        el.addEventListener("change", function () {
          stateApi.state.filters[b.key] = el.value;
          refreshAll();
        });
      }
    });

    const kwInput = document.getElementById("keywordSearch");
    if (kwInput) {
      kwInput.addEventListener("input", function () {
        stateApi.state.filters.keyword = kwInput.value;
        refreshAll();
      });
    }

    // Quick Chips
    document.querySelectorAll("[data-chip]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        const key = chip.getAttribute("data-chip");
        stateApi.state.filters.chips[key] = !stateApi.state.filters.chips[key];
        refreshAll();
      });
    });

    // Campus Quick Pills
    document.getElementById("campusQuickButtons").addEventListener("click", function (e) {
      const btn = e.target.closest("[data-campus-pill]");
      if (!btn) return;
      stateApi.state.filters.university = btn.getAttribute("data-campus-pill");
      refreshAll();
    });

    // Nav & Modal Triggers
    ["openSavedBtn", "mobileSavedBtn", "footerSavedBtn"].forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", openSavedDrawer);
    });

    ["openCompareNavBtn", "launchCompareBtn"].forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", openCompareModal);
    });

    ["openPostAdBtn", "mobilePostAdBtn", "bannerPostAdBtn", "footerPostBtn"].forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", openPostAdModal);
    });

    document.getElementById("clearCompareBtn").addEventListener("click", function () {
      stateApi.clearCompare();
      refreshAll();
      ui.showToast("Comparison tray cleared.");
    });

    document.getElementById("resetDemoDataBtn").addEventListener("click", function () {
      stateApi.resetDemoData();
      refreshAll();
      ui.showToast("Demo data restored to default Sri Lankan listings.");
    });

    // Photo File Upload Preview
    const uploadInput = document.getElementById("adPhotoUpload");
    if (uploadInput) {
      uploadInput.addEventListener("change", function () {
        const file = uploadInput.files && uploadInput.files[0];
        if (!file) {
          uploadedDataUrl = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
          uploadedDataUrl = String(ev.target.result || "");
        };
        reader.readAsDataURL(file);
      });
    }

    // Forms
    document.getElementById("postAdForm").addEventListener("submit", handlePostAdSubmit);
    document.getElementById("inquiryForm").addEventListener("submit", handleInquirySubmit);

    // Delegated Actions across Grid, Modals, Drawer, Tray
    document.addEventListener("click", function (e) {
      const actionEl = e.target.closest("[data-action]");
      if (actionEl) {
        const action = actionEl.getAttribute("data-action");
        const id = actionEl.getAttribute("data-id");

        if (action === "view-details" && id) {
          closeBackdrop("savedDrawerBackdrop");
          closeBackdrop("compareModalBackdrop");
          openDetails(id);
          return;
        }
        if (action === "toggle-save" && id) {
          const added = stateApi.toggleSaved(id);
          refreshAll();
          ui.showToast(added ? "Added to your Saved Shortlist." : "Removed from Saved Shortlist.");
          return;
        }
        if (action === "toggle-compare" && id) {
          const res = stateApi.toggleCompare(id);
          if (res.status === "limit") {
            ui.showToast("You can compare up to 3 boarding places at once.", "warn");
          } else {
            refreshAll();
            ui.showToast(res.status === "added" ? "Added to comparison tray." : "Removed from comparison.");
          }
          return;
        }
        if (action === "open-inquiry" && id) {
          openInquiryModal(id);
          return;
        }
        if (action === "copy-phone") {
          const phone = actionEl.getAttribute("data-phone") || "";
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(phone).catch(function () {});
          }
          ui.showToast("Copied owner number: " + phone);
          return;
        }
        if (action === "gallery-prev" || action === "gallery-next" || action === "gallery-thumb") {
          const activeItem = stateApi.getListingById(stateApi.state.activeDetailsId);
          if (!activeItem || !activeItem.photos.length) return;
          const total = activeItem.photos.length;
          if (action === "gallery-prev") {
            stateApi.state.activePhotoIndex = (stateApi.state.activePhotoIndex - 1 + total) % total;
          } else if (action === "gallery-next") {
            stateApi.state.activePhotoIndex = (stateApi.state.activePhotoIndex + 1) % total;
          } else {
            stateApi.state.activePhotoIndex = Number(actionEl.getAttribute("data-index")) || 0;
          }
          ui.renderDetailsModal(activeItem.id);
          return;
        }
      }

      // Close triggers
      if (e.target.closest("[data-close-saved]") || e.target.id === "savedDrawerBackdrop") {
        closeBackdrop("savedDrawerBackdrop");
      }
      if (e.target.closest("[data-close-details]") || e.target.id === "detailsModalBackdrop") {
        closeBackdrop("detailsModalBackdrop");
      }
      if (e.target.closest("[data-close-compare]") || e.target.id === "compareModalBackdrop") {
        closeBackdrop("compareModalBackdrop");
      }
      if (e.target.closest("[data-close-post]") || e.target.id === "postAdModalBackdrop") {
        closeBackdrop("postAdModalBackdrop");
      }
      if (e.target.closest("[data-close-inquiry]") || e.target.id === "inquiryModalBackdrop") {
        closeBackdrop("inquiryModalBackdrop");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAllModals();
      }
    });
  }

  function init() {
    ui.populateUniversitySelects();
    ui.populateAmenityCheckboxes();
    bindEvents();
    refreshAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window);
