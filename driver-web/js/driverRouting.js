/**
 * HomeVibes Driver Web — Routing & Live Turn-by-Turn Navigation Engine
 * Provides route generation, waypoint polyline rendering, maneuver instructions, and active GPS navigation.
 */

class DriverRoutingEngine {
  constructor() {
    this.map = null;
    this.markers = {
      driver: null,
      hub: null,
      customer: null
    };
    this.routePolyline = null;
    this.pulseCircle = null;

    this.currentMode = "TO_HUB"; // "TO_HUB" | "TO_CUSTOMER" | "FULL"
    this.isNavigating = false;
    this.navInterval = null;
    this.navStepIndex = 0;

    // Default Geo-coordinates (Bengaluru)
    this.driverPos = [12.9410, 77.6180]; // Near Koramangala Sony World
    this.hubPos = [12.9352, 77.6245];    // HomeVibes Staging Hub (Koramangala 4th Block)
    this.customerPos = [12.9279, 77.6710]; // Bellandur Green Glen Layout
    this.customerAddress = "Flat 402, Green Glen Layout, Bellandur, Bengaluru";

    this.waypoints = [];
    this.turnInstructions = [];
  }

  initMap(containerId = "driverRouteMap") {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(containerId, {
      zoomControl: false,
      attributionControl: true
    }).setView(this.driverPos, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.setupCustomIcons();
    this.renderRoute();
  }

  setupCustomIcons() {
    this.hubIcon = L.divIcon({
      className: 'custom-driver-map-icon',
      html: `
        <div style="background:#1C1C1C; color:#FFF; width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; border:2px solid #FFF; box-shadow:0 3px 10px rgba(0,0,0,0.3);">
          HUB
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    this.customerIcon = L.divIcon({
      className: 'custom-driver-map-icon',
      html: `
        <div style="background:#E85D3F; color:#FFF; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; border:2px solid #FFF; box-shadow:0 3px 10px rgba(0,0,0,0.3);">
          DROP
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    this.driverIcon = L.divIcon({
      className: 'custom-driver-map-icon',
      html: `
        <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:0; border-radius:50%; background:rgba(37,99,235,0.3); animation:pulse-beacon 1.8s infinite;"></div>
          <div style="background:#2563EB; color:#FFF; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; border:2px solid #FFF; box-shadow:0 3px 10px rgba(37,99,235,0.5); z-index:2;">
            GPS
          </div>
        </div>
        <style>
          @keyframes pulse-beacon {
            0% { transform:scale(0.8); opacity:1; }
            100% { transform:scale(1.8); opacity:0; }
          }
        </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  setDestination(lat, lng, address = "Customer Destination") {
    if (lat && lng) {
      this.customerPos = [Number(lat), Number(lng)];
      this.customerAddress = address;
      this.renderRoute();
    }
  }

  setRouteMode(mode) {
    this.currentMode = mode;
    this.renderRoute();
  }

  renderRoute() {
    if (!this.map) return;

    // Clear existing markers & lines
    if (this.markers.driver) this.map.removeLayer(this.markers.driver);
    if (this.markers.hub) this.map.removeLayer(this.markers.hub);
    if (this.markers.customer) this.map.removeLayer(this.markers.customer);
    if (this.routePolyline) this.map.removeLayer(this.routePolyline);

    // Place Hub & Customer Markers
    this.markers.hub = L.marker(this.hubPos, { icon: this.hubIcon })
      .addTo(this.map)
      .bindPopup("<b>HomeVibes Staging Hub</b><br>Koramangala 4th Block, Bengaluru");

    this.markers.customer = L.marker(this.customerPos, { icon: this.customerIcon })
      .addTo(this.map)
      .bindPopup(`<b>Delivery Destination</b><br>${this.customerAddress}`);

    this.markers.driver = L.marker(this.driverPos, { icon: this.driverIcon })
      .addTo(this.map)
      .bindPopup("<b>Fleet Driver: Ravi Kumar</b><br>Vehicle: KA-01-HV-2026 (Electric)");

    // Determine target route polyline & maneuvers
    let pathPoints = [];
    let routeColor = "#2563EB";

    if (this.currentMode === "TO_HUB") {
      routeColor = "#2563EB";
      pathPoints = this.generateWaypoints(this.driverPos, this.hubPos, [
        [12.9390, 77.6195],
        [12.9372, 77.6218]
      ]);
      this.generateTurnInstructions("TO_HUB");
    } else if (this.currentMode === "TO_CUSTOMER") {
      routeColor = "#E85D3F";
      pathPoints = this.generateWaypoints(this.hubPos, this.customerPos, [
        [12.9335, 77.6320],
        [12.9300, 77.6480],
        [12.9288, 77.6610]
      ]);
      this.generateTurnInstructions("TO_CUSTOMER");
    } else {
      // FULL RUN
      routeColor = "#1C1C1C";
      pathPoints = [
        ...this.generateWaypoints(this.driverPos, this.hubPos, [[12.9390, 77.6195], [12.9372, 77.6218]]),
        ...this.generateWaypoints(this.hubPos, this.customerPos, [[12.9335, 77.6320], [12.9300, 77.6480], [12.9288, 77.6610]])
      ];
      this.generateTurnInstructions("FULL");
    }

    this.waypoints = pathPoints;

    this.routePolyline = L.polyline(pathPoints, {
      color: routeColor,
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
      lineJoin: 'round'
    }).addTo(this.map);

    try {
      this.map.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });
    } catch (_) {}

    this.updateHUD();
    this.renderStepCards();
  }

  generateWaypoints(start, end, intermediate = []) {
    const pts = [start, ...intermediate, end];
    // Interpolate smoother curve steps for realistic driving telemetry
    const result = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const steps = 6;
      for (let s = 0; s < steps; s++) {
        const factor = s / steps;
        result.push([
          p1[0] + (p2[0] - p1[0]) * factor,
          p1[1] + (p2[1] - p1[1]) * factor
        ]);
      }
    }
    result.push(end);
    return result;
  }

  generateTurnInstructions(mode) {
    if (mode === "TO_HUB") {
      this.turnInstructions = [
        {
          type: "STRAIGHT",
          instruction: "Head South on 80 Feet Road toward Sony World Junction",
          distance: "450 m",
          time: "2 min"
        },
        {
          type: "TURN_LEFT",
          instruction: "Turn left onto Koramangala 4th Block Main Road",
          distance: "600 m",
          time: "3 min"
        },
        {
          type: "TURN_RIGHT",
          instruction: "Turn right at Staging Bay Gate B",
          distance: "150 m",
          time: "1 min"
        },
        {
          type: "ARRIVED",
          instruction: "Arrive at HomeVibes Raw Materials Staging Hub",
          distance: "0 m",
          time: "Arrival"
        }
      ];
    } else {
      this.turnInstructions = [
        {
          type: "STRAIGHT",
          instruction: "Exit Hub onto Koramangala Inner Ring Road",
          distance: "1.2 km",
          time: "4 min"
        },
        {
          type: "MERGE",
          instruction: "Merge onto Outer Ring Road toward Bellandur Flyover",
          distance: "2.8 km",
          time: "7 min"
        },
        {
          type: "TURN_RIGHT",
          instruction: "Turn right onto Green Glen Layout Main Rd",
          distance: "550 m",
          time: "2 min"
        },
        {
          type: "ARRIVED",
          instruction: `Arrive at Customer: ${this.customerAddress}`,
          distance: "50 m",
          time: "Arrival"
        }
      ];
    }
  }

  updateHUD() {
    const nextTurn = this.turnInstructions[0] || {
      instruction: "Proceed along marked delivery route",
      distance: "2.8 km"
    };

    const hudTitle = document.getElementById("hudInstruction");
    const hudDist = document.getElementById("hudDistance");
    const hudEta = document.getElementById("hudEta");
    const hudTotalDist = document.getElementById("hudTotalDist");

    if (hudTitle) hudTitle.textContent = nextTurn.instruction;
    if (hudDist) hudDist.textContent = `In ${nextTurn.distance}`;

    const totalKm = this.currentMode === "TO_HUB" ? 1.4 : 4.6;
    const etaMins = this.currentMode === "TO_HUB" ? 6 : 14;

    if (hudEta) hudEta.textContent = `${etaMins} mins`;
    if (hudTotalDist) hudTotalDist.textContent = `${totalKm} km`;
  }

  renderStepCards() {
    const container = document.getElementById("turnByTurnList");
    if (!container) return;

    container.innerHTML = this.turnInstructions.map((step, idx) => {
      const isActive = idx === 0;
      return `
        <div class="step-card ${isActive ? 'active' : ''}">
          <div class="step-num">${idx + 1}</div>
          <div style="flex:1;">
            <div class="step-instruction">${step.instruction}</div>
            <div class="step-distance">${step.distance} &bull; est. ${step.time}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  /**
   * Start Live Simulated GPS Navigation
   * Advances the driver marker along the route and emits live GPS to Supabase.
   */
  startNavigation(onStepUpdate) {
    if (this.isNavigating) return;
    this.isNavigating = true;
    this.navStepIndex = 0;

    const navBtn = document.getElementById("btnToggleNav");
    if (navBtn) {
      navBtn.classList.replace("btn-primary", "btn-secondary");
      navBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Pause Route Navigation</span>
      `;
    }

    this.navInterval = setInterval(() => {
      if (this.navStepIndex >= this.waypoints.length) {
        this.stopNavigation();
        if (typeof onStepUpdate === "function") {
          onStepUpdate({ reachedDestination: true });
        }
        return;
      }

      const nextPos = this.waypoints[this.navStepIndex];
      this.driverPos = nextPos;

      if (this.markers.driver) {
        this.markers.driver.setLatLng(nextPos);
      }

      // Smooth camera pan
      if (this.map && this.navStepIndex % 3 === 0) {
        this.map.panTo(nextPos, { animate: true, duration: 1.0 });
      }

      // Broadcast telemetry to Supabase in background
      if (window.driverDataService) {
        window.driverDataService.updateLiveLocation(nextPos[0], nextPos[1]);
      }

      if (typeof onStepUpdate === "function") {
        onStepUpdate({
          stepIndex: this.navStepIndex,
          totalSteps: this.waypoints.length,
          pos: nextPos
        });
      }

      this.navStepIndex++;
    }, 1800);
  }

  stopNavigation() {
    this.isNavigating = false;
    if (this.navInterval) {
      clearInterval(this.navInterval);
      this.navInterval = null;
    }

    const navBtn = document.getElementById("btnToggleNav");
    if (navBtn) {
      navBtn.classList.replace("btn-secondary", "btn-primary");
      navBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Start Live Navigation</span>
      `;
    }
  }

  /**
   * Launch Native Google Maps driving directions
   */
  openExternalNavigation() {
    const dest = this.currentMode === "TO_HUB" ? this.hubPos : this.customerPos;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${this.driverPos[0]},${this.driverPos[1]}&destination=${dest[0]},${dest[1]}&travelmode=driving`;
    window.open(url, "_blank");
  }
}

window.driverRouting = new DriverRoutingEngine();
