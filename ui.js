(function (global) {
  "use strict";

  const { UNIVERSITIES, AMENITIES } = global.CampusNestData;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatLKR(amount) {
    const num = Number(amount) || 0;
    return "LKR " + num.toLocaleString("en-LK");
  }

  function formatDistance(meters) {
    const m = Number(meters) || 0;
    if (m >= 1000) {
      return (m / 1000).toFixed(1).replace(/\.0$/, "") + " km";
    }
    return m + " m";
  }

  function getAmenityLabel(id, shortForm) {
    const found = AMENITIES.find(function (a) {
      return a.id === id;
    });
    if (!found) return id;
    return shortForm ? found.short : found.label;
  }

  function getGenderBadgeClass(gender) {
    if (gender === "Boys Only") return "badge-boys";
    if (gender === "Girls Only") return "badge-girls";
    return "badge-mixed";
  }

  function getAvailabilityClass(status) {
    return status === "Available Now" ? "badge-availability" : "badge-limited";
  }

  function getInitials(name) {
    const cleaned = String(name || "Owner")
      .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, "")
      .trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function showToast(message, variant) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast" + (variant === "warn" ? " toast-warn" : "");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, 3400);
  }

  function populateUniversitySelects() {
    const selectIds = ["heroUniversity", "filterUniversity", "adUniversity"];
    selectIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      const keepFirst = el.querySelector("option");
      el.innerHTML = "";
      if (keepFirst) el.appendChild(keepFirst);
      UNIVERSITIES.forEach(function (u) {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.id + " (" + u.city + ")";
        el.appendChild(opt);
      });
    });
  }

  function populateAmenityCheckboxes() {
    const grid = document.getElementById("adAmenitiesGrid");
    if (!grid) return;
    grid.innerHTML = AMENITIES.map(function (a) {
      return (
        '<label class="check-tile">' +
        '<input type="checkbox" name="amenities" value="' + escapeHtml(a.id) + '" />' +
        "<span>" + escapeHtml(a.label) + "</span>" +
        "</label>"
      );
    }).join("");
  }

  function renderCampusQuickButtons(activeUni) {
    const wrap = document.getElementById("campusQuickButtons");
    if (!wrap) return;
    const buttons = ['<button type="button" class="campus-pill ' + (activeUni === "all" ? "active" : "") + '" data-campus-pill="all">All Campuses</button>'];
    UNIVERSITIES.forEach(function (u) {
      const isActive = activeUni === u.id;
      buttons.push(
        '<button type="button" class="campus-pill ' +
          (isActive ? "active" : "") +
          '" data-campus-pill="' +
          escapeHtml(u.id) +
          '">' +
          escapeHtml(u.short) +
          "</button>"
      );
    });
    wrap.innerHTML = buttons.join("");
  }

  function syncFilterInputs(state) {
    const f = state.filters;
    const map = {
      heroUniversity: f.university,
      filterUniversity: f.university,
      heroRentRange: f.rentRange,
      filterRentRange: f.rentRange,
      heroRoomType: f.roomType,
      filterRoomType: f.roomType,
      heroGender: f.gender,
      filterGender: f.gender,
      keywordSearch: f.keyword,
      sortSelect: f.sort
    };
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.value !== map[id]) el.value = map[id];
    });

    document.querySelectorAll("[data-chip]").forEach(function (chipBtn) {
      const key = chipBtn.getAttribute("data-chip");
      chipBtn.classList.toggle("active", Boolean(f.chips[key]));
    });

    const clearBtn = document.getElementById("clearAllFiltersBtn");
    if (clearBtn) {
      clearBtn.classList.toggle("hidden", !global.CampusNestState.hasActiveFilters());
    }
    renderCampusQuickButtons(f.university);
  }

  function renderListings() {
    const stateApi = global.CampusNestState;
    const state = stateApi.state;
    const filtered = stateApi.getFilteredListings();
    const grid = document.getElementById("listingsGrid");
    const emptyState = document.getElementById("emptyState");
    const summary = document.getElementById("resultsSummary");
    const heroCount = document.getElementById("heroTotalListings");

    if (heroCount) {
      heroCount.textContent = state.listings.length + "+";
    }

    if (summary) {
      const uniText = state.filters.university === "all" ? "across all campuses" : "near " + state.filters.university;
      summary.textContent =
        "Showing " +
        filtered.length +
        " of " +
        state.listings.length +
        " boarding " +
        (filtered.length === 1 ? "place " : "places ") +
        uniText;
    }

    if (!grid || !emptyState) return;

    if (filtered.length === 0) {
      grid.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    grid.innerHTML = filtered
      .map(function (item) {
        const isSaved = state.savedIds.includes(item.id);
        const inCompare = state.compareIds.includes(item.id);
        const visibleAmenities = item.amenities.slice(0, 4);
        const extraCount = item.amenities.length - visibleAmenities.length;

        return (
          '<article class="listing-card" data-listing-id="' + escapeHtml(item.id) + '">' +
            '<div class="card-media">' +
              '<img src="' + escapeHtml(item.photos[0]) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />' +
              '<div class="card-top-badges">' +
                (item.verified ? '<span class="badge badge-verified">✓ Verified</span>' : "") +
                '<span class="badge ' + getGenderBadgeClass(item.gender) + '">' + escapeHtml(item.gender) + "</span>" +
                '<span class="badge badge-room">' + escapeHtml(item.roomType) + "</span>" +
              "</div>" +
              '<button type="button" class="save-icon-btn ' + (isSaved ? "saved" : "") + '" data-action="toggle-save" data-id="' + escapeHtml(item.id) + '" aria-label="' + (isSaved ? "Remove from saved" : "Save boarding place") + '" title="' + (isSaved ? "Saved" : "Save / Shortlist") + '">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="' + (isSaved ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2">' +
                  '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>' +
                "</svg>" +
              "</button>" +
            "</div>" +
            '<div class="card-body">' +
              '<div class="card-price-row">' +
                '<div class="card-price">' + formatLKR(item.rent) + " <span>/ month</span></div>" +
                '<span class="badge ' + getAvailabilityClass(item.availability) + '">' + escapeHtml(item.availability) + "</span>" +
              "</div>" +
              '<h3 class="card-title">' + escapeHtml(item.title) + "</h3>" +
              '<div class="card-meta">' +
                '<div class="meta-line">' +
                  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' +
                  "<span><strong>" + escapeHtml(item.university) + "</strong></span>" +
                "</div>" +
                '<div class="meta-line">' +
                  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
                  "<span>" + formatDistance(item.distanceMeters) + " · " + escapeHtml(item.walkTime) + "</span>" +
                "</div>" +
              "</div>" +
              '<div class="card-amenities">' +
                visibleAmenities
                  .map(function (am) {
                    return '<span class="amenity-tag">' + escapeHtml(getAmenityLabel(am, true)) + "</span>";
                  })
                  .join("") +
                (extraCount > 0 ? '<span class="amenity-tag">+' + extraCount + " more</span>" : "") +
              "</div>" +
              '<div class="card-actions">' +
                '<button type="button" class="btn btn-primary btn-sm btn-details" data-action="view-details" data-id="' + escapeHtml(item.id) + '">View Details</button>' +
                '<button type="button" class="btn btn-outline btn-sm compare-toggle-btn ' + (inCompare ? "active" : "") + '" data-action="toggle-compare" data-id="' + escapeHtml(item.id) + '">' +
                  (inCompare ? "✓ Compared" : "+ Compare") +
                "</button>" +
              "</div>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderBadgesAndTray() {
    const state = global.CampusNestState.state;
    const savedCount = state.savedIds.length;
    const compareCount = state.compareIds.length;

    const savedBadge = document.getElementById("savedCountBadge");
    const mobileSaved = document.getElementById("mobileSavedCount");
    const compareBadge = document.getElementById("compareCountBadge");
    if (savedBadge) savedBadge.textContent = String(savedCount);
    if (mobileSaved) mobileSaved.textContent = String(savedCount);
    if (compareBadge) compareBadge.textContent = String(compareCount);

    const tray = document.getElementById("compareTray");
    const trayItems = document.getElementById("compareTrayItems");
    const launchBtn = document.getElementById("launchCompareBtn");

    if (!tray || !trayItems || !launchBtn) return;

    if (compareCount === 0) {
      tray.classList.add("hidden");
      return;
    }

    tray.classList.remove("hidden");
    const chipsHtml = state.compareIds
      .map(function (id) {
        const item = global.CampusNestState.getListingById(id);
        if (!item) return "";
        return (
          '<span class="compare-chip">' +
          "<span>" + escapeHtml(item.title.slice(0, 28)) + (item.title.length > 28 ? "…" : "") + " (" + formatLKR(item.rent) + ")</span>" +
          '<button type="button" data-action="toggle-compare" data-id="' + escapeHtml(item.id) + '" aria-label="Remove from comparison">✕</button>' +
          "</span>"
        );
      })
      .join("");

    trayItems.innerHTML =
      '<span style="font-size:0.84rem;font-weight:700;color:#fde68a;">Compare (' +
      compareCount +
      "/3):</span>" +
      chipsHtml;

    launchBtn.textContent = compareCount < 2 ? "Add 1 more to Compare" : "Compare Now (" + compareCount + ")";
  }

  function renderSavedDrawer() {
    const body = document.getElementById("savedDrawerBody");
    const sub = document.getElementById("savedDrawerSubtitle");
    const state = global.CampusNestState.state;
    if (!body || !sub) return;

    const savedListings = state.savedIds
      .map(function (id) {
        return global.CampusNestState.getListingById(id);
      })
      .filter(Boolean);

    sub.textContent = savedListings.length + " shortlisted boarding " + (savedListings.length === 1 ? "place" : "places");

    if (savedListings.length === 0) {
      body.innerHTML =
        '<div class="empty-state" style="padding:32px 16px;">' +
        '<div class="empty-icon">🔖</div>' +
        "<h3>No saved bodims yet</h3>" +
        "<p>Tap the bookmark icon on any listing card to keep track of your top choices.</p>" +
        "</div>";
      return;
    }

    body.innerHTML = savedListings
      .map(function (item) {
        const inCompare = state.compareIds.includes(item.id);
        return (
          '<div class="saved-item-card">' +
            '<img src="' + escapeHtml(item.photos[0]) + '" alt="' + escapeHtml(item.title) + '" />' +
            '<div class="saved-item-info">' +
              "<h4>" + escapeHtml(item.title) + "</h4>" +
              '<div class="saved-item-price">' + formatLKR(item.rent) + " / mo · " + escapeHtml(item.university) + "</div>" +
              '<div style="font-size:0.78rem;color:var(--text-light);margin-top:2px;">' + formatDistance(item.distanceMeters) + " · " + escapeHtml(item.gender) + "</div>" +
              '<div class="saved-item-actions">' +
                '<button type="button" class="btn btn-primary btn-xs" data-action="view-details" data-id="' + escapeHtml(item.id) + '">Details</button>' +
                '<button type="button" class="btn btn-outline btn-xs" data-action="toggle-compare" data-id="' + escapeHtml(item.id) + '">' + (inCompare ? "✓ Compare" : "+ Compare") + "</button>" +
                '<button type="button" class="btn btn-ghost btn-xs" data-action="toggle-save" data-id="' + escapeHtml(item.id) + '">Remove</button>' +
              "</div>" +
            "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderDetailsModal(id) {
    const item = global.CampusNestState.getListingById(id);
    const body = document.getElementById("detailsModalBody");
    if (!item || !body) return;

    const state = global.CampusNestState.state;
    const isSaved = state.savedIds.includes(item.id);
    const inCompare = state.compareIds.includes(item.id);
    const photos = item.photos && item.photos.length ? item.photos : ["assets/images/single-room.jpg"];
    const photoIdx = Math.min(state.activePhotoIndex, photos.length - 1);

    body.innerHTML =
      '<div class="details-gallery">' +
        '<div class="gallery-main">' +
          '<img id="detailsMainPhoto" src="' + escapeHtml(photos[photoIdx]) + '" alt="' + escapeHtml(item.title) + '" />' +
          (photos.length > 1
            ? '<button type="button" class="gallery-nav gallery-prev" data-action="gallery-prev" aria-label="Previous photo">‹</button>' +
              '<button type="button" class="gallery-nav gallery-next" data-action="gallery-next" aria-label="Next photo">›</button>'
            : "") +
        "</div>" +
        (photos.length > 1
          ? '<div class="gallery-thumbs">' +
            photos
              .map(function (src, idx) {
                return (
                  '<button type="button" class="gallery-thumb ' +
                  (idx === photoIdx ? "active" : "") +
                  '" data-action="gallery-thumb" data-index="' +
                  idx +
                  '"><img src="' +
                  escapeHtml(src) +
                  '" alt="Gallery view ' +
                  (idx + 1) +
                  '" /></button>'
                );
              })
              .join("") +
            "</div>"
          : "") +
      "</div>" +
      '<div class="details-layout">' +
        "<div>" +
          '<div class="details-badges">' +
            (item.verified ? '<span class="badge badge-verified">✓ Verified Listing</span>' : '<span class="badge badge-limited">Community Listing</span>') +
            '<span class="badge ' + getGenderBadgeClass(item.gender) + '">' + escapeHtml(item.gender) + "</span>" +
            '<span class="badge badge-room">' + escapeHtml(item.roomType) + "</span>" +
            '<span class="badge ' + getAvailabilityClass(item.availability) + '">' + escapeHtml(item.availability) + "</span>" +
          "</div>" +
          '<h2 class="details-title" id="detailsModalTitle">' + escapeHtml(item.title) + "</h2>" +
          '<p style="margin:0;color:var(--text-muted);font-size:0.92rem;"><strong>' + escapeHtml(item.university) + "</strong> · " + escapeHtml(item.area) + "</p>" +
          '<div class="details-price-box">' +
            '<div class="price-metric"><span>Monthly Rent</span><strong>' + formatLKR(item.rent) + "</strong></div>" +
            '<div class="price-metric"><span>Key Money / Advance</span><strong>' + formatLKR(item.deposit) + "</strong></div>" +
            '<div class="price-metric"><span>Campus Distance</span><strong>' + formatDistance(item.distanceMeters) + "</strong></div>" +
          "</div>" +
          '<div class="detail-block"><h3>About This Boarding Place</h3><p style="margin:0;color:var(--text-muted);font-size:0.92rem;">' + escapeHtml(item.description) + "</p></div>" +
          '<div class="detail-block"><h3>Walking &amp; Bus Access</h3><ul class="rules-list">' +
            "<li><strong>Walking / Gate:</strong> " + escapeHtml(item.walkTime) + " (" + formatDistance(item.distanceMeters) + ")</li>" +
            "<li><strong>Bus / Transit:</strong> " + escapeHtml(item.busRoute || "Frequent town & campus buses nearby") + "</li>" +
            "<li><strong>Utility Bills:</strong> " + escapeHtml(item.billsNote || "Confirm electricity & water split with owner") + "</li>" +
          "</ul></div>" +
          '<div class="detail-block"><h3>House Rules &amp; Policies</h3><ul class="rules-list">' +
            "<li><strong>Curfew / Gate:</strong> " + escapeHtml(item.curfew || "Standard 10:30 PM gate closing") + "</li>" +
            "<li><strong>Visitors:</strong> " + escapeHtml(item.visitors || "Daytime guests allowed in common area") + "</li>" +
          "</ul></div>" +
          '<div class="detail-block"><h3>Included Facilities</h3><div class="details-amenities-grid">' +
            item.amenities
              .map(function (am) {
                return '<div class="amenity-pill-box">✓ ' + escapeHtml(getAmenityLabel(am, false)) + "</div>";
              })
              .join("") +
          "</div></div>" +
        "</div>" +
        '<aside class="owner-side-card">' +
          '<div class="owner-header">' +
            '<div class="owner-avatar">' + escapeHtml(getInitials(item.ownerName)) + "</div>" +
            "<div>" +
              '<div style="font-weight:700;font-size:0.98rem;">' + escapeHtml(item.ownerName) + "</div>" +
              '<div style="font-size:0.78rem;color:var(--text-light);">' + escapeHtml(item.ownerSince || "Boarding Owner") + "</div>" +
            "</div>" +
          "</div>" +
          '<div class="owner-meta-box">' +
            "<div><strong>Phone / WhatsApp:</strong> " + escapeHtml(item.ownerPhone) + "</div>" +
            "<div><strong>Preferred Tenants:</strong> " + escapeHtml(item.gender) + " (" + escapeHtml(item.roomType) + ")</div>" +
            "<div><strong>Response Time:</strong> Usually replies within 1–2 hrs</div>" +
          "</div>" +
          '<div class="owner-actions-stack">' +
            '<button type="button" class="btn btn-primary" data-action="open-inquiry" data-id="' + escapeHtml(item.id) + '">Send Inquiry / View Phone</button>' +
            '<button type="button" class="btn btn-outline" data-action="copy-phone" data-phone="' + escapeHtml(item.ownerPhone) + '">Copy Phone: ' + escapeHtml(item.ownerPhone) + "</button>" +
            '<button type="button" class="btn btn-outline" data-action="toggle-save" data-id="' + escapeHtml(item.id) + '">' + (isSaved ? "✓ Saved in Shortlist" : "Save / Shortlist") + "</button>" +
            '<button type="button" class="btn btn-outline" data-action="toggle-compare" data-id="' + escapeHtml(item.id) + '">' + (inCompare ? "✓ Added to Compare" : "+ Add to Compare") + "</button>" +
          "</div>" +
        "</aside>" +
      "</div>";
  }

  function renderComparisonModal() {
    const body = document.getElementById("compareModalBody");
    const state = global.CampusNestState.state;
    if (!body) return;

    const items = state.compareIds
      .map(function (id) {
        return global.CampusNestState.getListingById(id);
      })
      .filter(Boolean);

    if (items.length < 2) {
      body.innerHTML =
        '<div class="empty-state" style="padding:36px 20px;">' +
        '<div class="empty-icon">⚖️</div>' +
        "<h3>Select 2 or 3 boarding places to compare</h3>" +
        "<p>You currently have " + items.length + " selected. Click <strong>+ Compare</strong> on at least 2 listings to view them side-by-side.</p>" +
        "</div>";
      return;
    }

    const minRent = Math.min.apply(null, items.map(function (i) { return i.rent; }));
    const minDist = Math.min.apply(null, items.map(function (i) { return i.distanceMeters; }));

    const headerCells = items
      .map(function (item) {
        return (
          "<td>" +
            '<div class="compare-col-head">' +
              '<img src="' + escapeHtml(item.photos[0]) + '" alt="' + escapeHtml(item.title) + '" />' +
              '<strong style="font-size:0.95rem;">' + escapeHtml(item.title) + "</strong>" +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
                '<button type="button" class="btn btn-primary btn-xs" data-action="view-details" data-id="' + escapeHtml(item.id) + '">View</button>' +
                '<button type="button" class="btn btn-ghost btn-xs" data-action="toggle-compare" data-id="' + escapeHtml(item.id) + '">Remove</button>' +
              "</div>" +
            "</div>" +
          "</td>"
        );
      })
      .join("");

    function makeRow(label, renderCell) {
      return (
        "<tr><th>" +
        escapeHtml(label) +
        "</th>" +
        items
          .map(function (item) {
            return "<td>" + renderCell(item) + "</td>";
          })
          .join("") +
        "</tr>"
      );
    }

    const amenityRows = AMENITIES.map(function (am) {
      return makeRow(am.label, function (item) {
        return item.amenities.includes(am.id)
          ? '<span style="color:var(--verified-text);font-weight:700;">✓ Included</span>'
          : '<span style="color:var(--text-light);">—</span>';
      });
    }).join("");

    body.innerHTML =
      '<div class="compare-table-wrap"><table class="compare-table">' +
        "<thead><tr><th>Property</th>" + headerCells + "</tr></thead>" +
        "<tbody>" +
          makeRow("University / Area", function (i) {
            return "<strong>" + escapeHtml(i.university) + "</strong><br/><span style='color:var(--text-light);font-size:0.82rem;'>" + escapeHtml(i.area) + "</span>";
          }) +
          makeRow("Monthly Rent", function (i) {
            return (
              "<strong>" + formatLKR(i.rent) + "</strong>" +
              (i.rent === minRent ? '<span class="best-highlight">Lowest</span>' : "")
            );
          }) +
          makeRow("Key Money / Deposit", function (i) {
            return formatLKR(i.deposit);
          }) +
          makeRow("Distance to Gate", function (i) {
            return (
              "<strong>" + formatDistance(i.distanceMeters) + "</strong>" +
              (i.distanceMeters === minDist ? '<span class="best-highlight">Nearest</span>' : "") +
              "<br/><span style='color:var(--text-light);font-size:0.82rem;'>" + escapeHtml(i.walkTime) + "</span>"
            );
          }) +
          makeRow("Room & Gender", function (i) {
            return escapeHtml(i.roomType) + " · " + escapeHtml(i.gender);
          }) +
          makeRow("Availability", function (i) {
            return '<span class="badge ' + getAvailabilityClass(i.availability) + '">' + escapeHtml(i.availability) + "</span>";
          }) +
          makeRow("Verification", function (i) {
            return i.verified ? '<span class="badge badge-verified">✓ Verified</span>' : "Unverified";
          }) +
          makeRow("Curfew / Visitors", function (i) {
            return escapeHtml(i.curfew) + "<br/><span style='color:var(--text-light);font-size:0.8rem;'>" + escapeHtml(i.visitors) + "</span>";
          }) +
          makeRow("Bills Policy", function (i) {
            return escapeHtml(i.billsNote);
          }) +
          amenityRows +
        "</tbody>" +
      "</table></div>";
  }

  function renderInquiryModal(id) {
    const item = global.CampusNestState.getListingById(id);
    if (!item) return;
    document.getElementById("inquiryListingId").value = item.id;
    document.getElementById("inquiryListingSubtitle").textContent = item.title + " — " + formatLKR(item.rent) + "/mo";
    document.getElementById("inquiryOwnerCard").innerHTML =
      '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">' +
        "<div>" +
          '<div style="font-weight:700;font-size:0.96rem;">' + escapeHtml(item.ownerName) + "</div>" +
          '<div style="font-size:0.86rem;color:var(--text-muted);">Phone / WhatsApp: <strong>' + escapeHtml(item.ownerPhone) + "</strong></div>" +
        "</div>" +
        '<button type="button" class="btn btn-outline btn-xs" data-action="copy-phone" data-phone="' + escapeHtml(item.ownerPhone) + '">Copy Number</button>' +
      "</div>";

    const moveInInput = document.getElementById("inqMoveIn");
    if (moveInInput && !moveInInput.value) {
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      moveInInput.value = nextWeek;
    }
  }

  global.CampusNestUI = {
    escapeHtml: escapeHtml,
    formatLKR: formatLKR,
    showToast: showToast,
    populateUniversitySelects: populateUniversitySelects,
    populateAmenityCheckboxes: populateAmenityCheckboxes,
    syncFilterInputs: syncFilterInputs,
    renderListings: renderListings,
    renderBadgesAndTray: renderBadgesAndTray,
    renderSavedDrawer: renderSavedDrawer,
    renderDetailsModal: renderDetailsModal,
    renderComparisonModal: renderComparisonModal,
    renderInquiryModal: renderInquiryModal
  };
})(window);
