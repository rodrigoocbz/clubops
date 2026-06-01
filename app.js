const defaultPlayers = [
  { id: 1, name: "Dani Martin", pos: "POR", attendance: 92, load: 48, form: 87, status: "OK", available: true, minutes: 810, goals: 0 },
  { id: 2, name: "Alvaro Cano", pos: "DEF", attendance: 86, load: 72, form: 78, status: "OK", available: true, minutes: 720, goals: 1 },
  { id: 3, name: "Hugo Prieto", pos: "DEF", attendance: 78, load: 64, form: 74, status: "OK", available: true, minutes: 690, goals: 0 },
  { id: 4, name: "Mario Gil", pos: "DEF", attendance: 82, load: 81, form: 71, status: "Carga alta", available: true, minutes: 760, goals: 2 },
  { id: 5, name: "Lucas Rivas", pos: "DEF", attendance: 74, load: 59, form: 69, status: "OK", available: true, minutes: 640, goals: 0 },
  { id: 6, name: "Pablo Sanz", pos: "MED", attendance: 95, load: 68, form: 91, status: "OK", available: true, minutes: 840, goals: 3 },
  { id: 7, name: "Iker Lopez", pos: "MED", attendance: 69, load: 76, form: 64, status: "Molestia", available: false, minutes: 520, goals: 1 },
  { id: 8, name: "Sergio Mora", pos: "MED", attendance: 88, load: 63, form: 86, status: "OK", available: true, minutes: 710, goals: 4 },
  { id: 9, name: "Adrian Vega", pos: "DEL", attendance: 91, load: 84, form: 88, status: "Carga alta", available: true, minutes: 780, goals: 9 },
  { id: 10, name: "Nico Ramos", pos: "DEL", attendance: 84, load: 71, form: 83, status: "OK", available: true, minutes: 700, goals: 7 },
  { id: 11, name: "Leo Suarez", pos: "DEL", attendance: 77, load: 58, form: 75, status: "OK", available: true, minutes: 560, goals: 5 },
  { id: 12, name: "Bruno Nieto", pos: "MED", attendance: 63, load: 42, form: 58, status: "Vuelve", available: false, minutes: 320, goals: 1 },
  { id: 13, name: "Marcos Reina", pos: "DEF", attendance: 81, load: 55, form: 72, status: "OK", available: true, minutes: 410, goals: 0 },
  { id: 14, name: "Jorge Medina", pos: "DEL", attendance: 66, load: 52, form: 67, status: "OK", available: true, minutes: 390, goals: 3 },
];

const defaultDrills = [
  { title: "Activacion y movilidad", minutes: 15, type: "Base", day: "Lun" },
  { title: "Presion tras perdida", minutes: 22, type: "Tactico", day: "Mar" },
  { title: "Finalizacion por carriles", minutes: 18, type: "Alta", day: "Jue" },
  { title: "Balon parado defensivo", minutes: 20, type: "Tactico", day: "Vie" },
];

const defaultFinances = [
  { concept: "Cuotas socios", amount: 840 },
  { concept: "Arbitrajes", amount: -180 },
  { concept: "Material", amount: -95 },
  { concept: "Patrocinio bar", amount: 260 },
  { concept: "Fichas federativas", amount: -210 },
];

const formations = {
  433: [
    [1, 50, 91],
    [2, 22, 72],
    [3, 41, 75],
    [4, 59, 75],
    [5, 78, 72],
    [6, 30, 51],
    [7, 50, 47],
    [8, 70, 51],
    [9, 29, 25],
    [10, 50, 19],
    [11, 71, 25],
  ],
  442: [
    [1, 50, 91],
    [2, 22, 73],
    [3, 41, 76],
    [4, 59, 76],
    [5, 78, 73],
    [6, 22, 50],
    [7, 41, 47],
    [8, 59, 47],
    [11, 78, 50],
    [9, 41, 22],
    [10, 59, 22],
  ],
  352: [
    [1, 50, 91],
    [2, 31, 75],
    [3, 50, 78],
    [4, 69, 75],
    [5, 16, 52],
    [6, 34, 49],
    [7, 50, 47],
    [8, 66, 49],
    [11, 84, 52],
    [9, 39, 21],
    [10, 61, 21],
  ],
};

const storageKey = "clubops-demo-state-v2";

let state = loadState();
let selectedPlayerId = null;

const els = {
  playersTable: document.querySelector("#playersTable"),
  lineupMarkers: document.querySelector("#lineupMarkers"),
  selectedPlayer: document.querySelector("#selectedPlayer"),
  drillList: document.querySelector("#drillList"),
  financeLines: document.querySelector("#financeLines"),
  financeChart: document.querySelector("#financeChart"),
  reportText: document.querySelector("#reportText"),
  searchInput: document.querySelector("#searchInput"),
  positionFilter: document.querySelector("#positionFilter"),
  intensityRange: document.querySelector("#intensityRange"),
  intensityLabel: document.querySelector("#intensityLabel"),
  financeForm: document.querySelector("#financeForm"),
  financeType: document.querySelector("#financeType"),
  playerDialog: document.querySelector("#playerDialog"),
  toast: document.querySelector("#toast"),
};

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return getDefaultState();

  try {
    const parsed = JSON.parse(saved);
    return {
      players: parsed.players || defaultPlayers,
      drills: parsed.drills || defaultDrills,
      finances: parsed.finances || defaultFinances,
      intensity: parsed.intensity || 70,
      formation: parsed.formation || "433",
    };
  } catch {
    return getDefaultState();
  }
}

function getDefaultState() {
  return {
    players: structuredClone(defaultPlayers),
    drills: structuredClone(defaultDrills),
    finances: structuredClone(defaultFinances),
    intensity: 70,
    formation: "433",
  };
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatEuro(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function lineupIds() {
  return formations[state.formation].map(([id]) => id);
}

function lineupPlayers() {
  const ids = lineupIds();
  return ids.map((id) => state.players.find((player) => player.id === id)).filter(Boolean);
}

function avg(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function getReadiness() {
  const players = state.players;
  const availability = Math.round((players.filter((player) => player.available).length / players.length) * 100);
  const attendance = avg(players.map((player) => player.attendance));
  const form = avg(lineupPlayers().map((player) => player.form));
  const riskPenalty = state.players.filter((player) => player.load >= 80).length * 5;
  return Math.max(0, Math.min(99, Math.round(attendance * 0.32 + availability * 0.28 + form * 0.32 - riskPenalty + 8)));
}

function statusFor(player) {
  if (!player.available) return "No disponible";
  if (player.load >= 82) return "Carga alta";
  if (player.load >= 74) return "Vigilar";
  if (player.form < 65) return "Baja forma";
  return "OK";
}

function statusClass(player) {
  const status = statusFor(player);
  if (status === "OK") return "status";
  if (status === "Carga alta" || status === "Vigilar") return "status warn";
  return "status out";
}

function loadClass(load) {
  return load >= 80 ? "load-pill high" : load >= 72 ? "load-pill warn" : "load-pill";
}

function renderSpark(containerId, values, variant = "") {
  const container = document.querySelector(containerId);
  const max = Math.max(...values, 1);
  container.className = `spark-bars ${variant}`.trim();
  container.innerHTML = values
    .map((value) => `<span style="--height: ${Math.max(12, Math.round((value / max) * 100))}%"></span>`)
    .join("");
}

function renderMetrics() {
  const avgAttendance = avg(state.players.map((player) => player.attendance));
  const riskCount = state.players.filter((player) => player.load >= 80).length;
  const monthlyBalance = state.finances.reduce((total, item) => total + item.amount, 0);
  const availablePlayers = state.players.filter((player) => player.available).length;
  const readiness = getReadiness();

  document.querySelector("#avgAttendance").textContent = `${avgAttendance}%`;
  document.querySelector("#attendanceCopy").textContent =
    avgAttendance >= 84 ? "ritmo alto de entreno" : avgAttendance >= 75 ? "ritmo correcto" : "necesita seguimiento";
  document.querySelector("#riskCount").textContent = riskCount.toString();
  document.querySelector("#monthlyBalance").textContent = formatEuro(monthlyBalance);
  document.querySelector("#availableCount").textContent = `${availablePlayers}/${state.players.length}`;
  document.querySelector("#availableCopy").textContent = `${Math.round((availablePlayers / state.players.length) * 100)}% de plantilla`;
  document.querySelector("#targetScore").textContent = `${readiness}%`;
  document.querySelector("#sideReadiness").textContent = `${readiness}%`;
  document.querySelector("#scoreRing").style.setProperty("--score", readiness);
  document.querySelector("#readinessTitle").textContent = readiness >= 82 ? "Listos para competir" : readiness >= 70 ? "Semana estable" : "Semana delicada";
  document.querySelector("#readinessCopy").textContent =
    readiness >= 82
      ? "El once llega con buena asistencia, forma suficiente y pocas bajas."
      : "Conviene revisar cargas altas, bajas y jugadores con poca asistencia.";

  renderSpark("#attendanceSpark", state.players.slice(0, 8).map((player) => player.attendance));
  renderSpark("#riskSpark", state.players.slice(0, 8).map((player) => player.load), "danger");
  renderSpark("#availableSpark", state.players.slice(0, 8).map((player) => (player.available ? 100 : 22)));
  renderSpark(
    "#financeSpark",
    state.finances.slice(-6).map((item) => Math.abs(item.amount)),
    "money",
  );
}

function renderPlayers() {
  const query = els.searchInput.value.trim().toLowerCase();
  const position = els.positionFilter.value;
  const filtered = state.players.filter((player) => {
    const matchesName = player.name.toLowerCase().includes(query);
    const matchesPosition = position === "all" || player.pos === position;
    return matchesName && matchesPosition;
  });

  els.playersTable.innerHTML = filtered
    .map(
      (player) => `
        <tr data-player="${player.id}">
          <td>
            <button class="player-cell row-button" type="button" data-open-player="${player.id}">
              <span class="avatar">${initials(player.name)}</span>
              <span>
                <strong>${player.name}</strong>
                <small>${player.minutes} min - ${player.goals} goles</small>
              </span>
            </button>
          </td>
          <td>${player.pos}</td>
          <td>
            <div class="progress" aria-label="${player.attendance}% de asistencia">
              <span style="--value: ${player.attendance}%"></span>
            </div>
          </td>
          <td><span class="${loadClass(player.load)}">${player.load}%</span></td>
          <td>
            <div class="progress form" aria-label="${player.form}% de forma">
              <span style="--value: ${player.form}%"></span>
            </div>
          </td>
          <td><span class="${statusClass(player)}">${statusFor(player)}</span></td>
          <td>
            <label class="switch" aria-label="Disponibilidad de ${player.name}">
              <input type="checkbox" data-player="${player.id}" ${player.available ? "checked" : ""} />
              <span></span>
            </label>
          </td>
        </tr>
      `,
    )
    .join("");

  els.playersTable.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.addEventListener("change", (event) => {
      const player = state.players.find((item) => item.id === Number(event.target.dataset.player));
      player.available = event.target.checked;
      player.status = statusFor(player);
      persist();
      renderAll();
      showToast("Disponibilidad actualizada");
    });
  });

  els.playersTable.querySelectorAll("[data-open-player]").forEach((button) => {
    button.addEventListener("click", () => openPlayer(Number(button.dataset.openPlayer)));
  });
}

function renderLineup() {
  const positionMap = new Map(formations[state.formation].map(([id, x, y]) => [id, { x, y }]));
  els.lineupMarkers.innerHTML = lineupPlayers()
    .map((player) => {
      const position = positionMap.get(player.id);
      return `
        <button
          class="player-marker"
          type="button"
          data-player="${player.id}"
          data-risk="${player.load >= 80 ? "high" : player.available ? "normal" : "out"}"
          style="left: ${position.x}%; top: ${position.y}%"
          aria-label="${player.name}, ${player.pos}"
        >
          <span>${initials(player.name)}</span>
          <small>${player.pos}</small>
        </button>
      `;
    })
    .join("");

  els.lineupMarkers.querySelectorAll(".player-marker").forEach((marker) => {
    marker.addEventListener("click", () => {
      const player = state.players.find((item) => item.id === Number(marker.dataset.player));
      els.selectedPlayer.innerHTML = `
        <strong>${player.name}</strong>
        <span>${player.pos} - asistencia ${player.attendance}% - carga ${player.load}% - forma ${player.form}% - ${player.available ? "disponible" : "baja"}</span>
      `;
      openPlayer(player.id);
    });
  });

  document.querySelector("#minutesTotal").textContent = lineupPlayers()
    .reduce((total, player) => total + player.minutes, 0)
    .toLocaleString("es-ES");
  document.querySelector("#lineupGoals").textContent = lineupPlayers()
    .reduce((total, player) => total + player.goals, 0)
    .toString();
}

function renderInsights() {
  const highLoad = state.players.filter((player) => player.load >= 80);
  const unavailable = state.players.filter((player) => !player.available);
  const lowAttendance = state.players.filter((player) => player.attendance < 72);
  const bestForm = [...state.players].sort((a, b) => b.form - a.form).slice(0, 2);
  const items = [
    {
      title: highLoad.length ? "Bajar carga" : "Carga controlada",
      copy: highLoad.length ? highLoad.map((player) => player.name).join(", ") : "No hay jugadores por encima del 80%.",
      type: highLoad.length ? "danger" : "good",
    },
    {
      title: unavailable.length ? "Bajas a revisar" : "Plantilla disponible",
      copy: unavailable.length ? unavailable.map((player) => player.name).join(", ") : "El once podria mantenerse sin cambios obligados.",
      type: unavailable.length ? "warn" : "good",
    },
    {
      title: "Mejor momento",
      copy: bestForm.map((player) => `${player.name} (${player.form}%)`).join(" - "),
      type: "good",
    },
    {
      title: lowAttendance.length ? "Asistencia floja" : "Compromiso estable",
      copy: lowAttendance.length ? lowAttendance.map((player) => player.name).join(", ") : "La media semanal sostiene el plan.",
      type: lowAttendance.length ? "warn" : "good",
    },
  ];

  document.querySelector("#insightList").innerHTML = items
    .map(
      (item) => `
        <article class="insight ${item.type}">
          <strong>${item.title}</strong>
          <span>${item.copy}</span>
        </article>
      `,
    )
    .join("");
}

function renderDrills() {
  const totalMinutes = state.drills.reduce((total, drill) => total + drill.minutes, 0);
  const dayLoads = ["Lun", "Mar", "Mie", "Jue", "Vie"].map((day) => ({
    day,
    load: state.drills.filter((drill) => drill.day === day).reduce((total, drill) => total + drill.minutes, 0),
  }));

  document.querySelector("#dayStrip").innerHTML = dayLoads
    .map(
      (item) => `
        <div class="day-load">
          <span>${item.day}</span>
          <strong>${item.load}</strong>
          <i style="--height: ${Math.max(12, Math.round((item.load / Math.max(totalMinutes, 1)) * 180))}%"></i>
        </div>
      `,
    )
    .join("");

  els.drillList.innerHTML = state.drills
    .map((drill, index) => {
      const tagClass = drill.type === "Alta" ? "tag danger" : drill.type === "Tactico" ? "tag warn" : "tag";
      return `
        <article class="drill-item">
          <div>
            <strong>${drill.title}</strong>
            <span>${drill.day} - ${drill.minutes} min</span>
          </div>
          <span class="${tagClass}">${drill.type}</span>
          <button class="mini-delete" data-delete-drill="${index}" type="button" aria-label="Eliminar bloque">&times;</button>
        </article>
      `;
    })
    .join("");

  els.drillList.querySelectorAll("[data-delete-drill]").forEach((button) => {
    button.addEventListener("click", () => {
      state.drills.splice(Number(button.dataset.deleteDrill), 1);
      persist();
      renderDrills();
      showToast("Bloque eliminado");
    });
  });
}

function renderFinances() {
  const balance = state.finances.reduce((total, item) => total + item.amount, 0);
  document.querySelector("#balancePill").textContent = formatEuro(balance);
  els.financeLines.innerHTML = state.finances
    .map(
      (item, index) => `
        <div class="finance-line">
          <span>${item.concept}</span>
          <strong class="${item.amount >= 0 ? "positive" : "negative"}">${formatEuro(item.amount)}</strong>
          <button class="mini-delete" data-delete-finance="${index}" type="button" aria-label="Eliminar movimiento">&times;</button>
        </div>
      `,
    )
    .join("");

  const max = Math.max(...state.finances.map((item) => Math.abs(item.amount)), 1);
  els.financeChart.innerHTML = state.finances
    .map(
      (item) => `
        <span
          class="${item.amount >= 0 ? "income" : "expense"}"
          style="--height: ${Math.max(10, Math.round((Math.abs(item.amount) / max) * 100))}%"
          title="${item.concept}: ${formatEuro(item.amount)}"
        ></span>
      `,
    )
    .join("");

  els.financeLines.querySelectorAll("[data-delete-finance]").forEach((button) => {
    button.addEventListener("click", () => {
      state.finances.splice(Number(button.dataset.deleteFinance), 1);
      persist();
      renderAll();
      showToast("Movimiento eliminado");
    });
  });
}

function generateReport() {
  const readiness = getReadiness();
  const highLoad = state.players.filter((player) => player.load >= 80).map((player) => player.name);
  const unavailable = state.players.filter((player) => !player.available).map((player) => player.name);
  const balance = state.finances.reduce((total, item) => total + item.amount, 0);
  const best = [...state.players].sort((a, b) => b.form - a.form)[0];
  const formation = state.formation.replace("", "");

  const loadCopy = highLoad.length
    ? `Gestionar carga de ${highLoad.join(", ")} antes del sabado.`
    : "Sin alertas graves de carga.";
  const availabilityCopy = unavailable.length
    ? `Pendientes de disponibilidad: ${unavailable.join(", ")}.`
    : "Plantilla disponible para mantener el plan.";

  els.reportText.textContent = `Preparacion ${readiness}% con sistema ${formation}. ${loadCopy} ${availabilityCopy} Jugador en mejor forma: ${best.name} (${best.form}%). Caja actual: ${formatEuro(balance)}. Sesion recomendada: intensidad ${state.intensity}% con foco en balon parado y transicion defensiva.`;
  showToast("Informe generado");
}

function setFormation(nextFormation) {
  state.formation = nextFormation;
  persist();
  document.querySelectorAll(".formation").forEach((button) => {
    button.classList.toggle("active", button.dataset.formation === nextFormation);
  });
  document.querySelector("#formationCopy").textContent =
    nextFormation === "433"
      ? "Once equilibrado para presionar arriba."
      : nextFormation === "442"
        ? "Estructura mas estable para proteger bandas."
        : "Mas presencia por dentro y carrileros largos.";
  renderAll();
  showToast(`Formacion ${nextFormation} aplicada`);
}

function optimizeLineup() {
  const unavailableIds = new Set(state.players.filter((player) => !player.available).map((player) => player.id));
  const candidate = state.players
    .filter((player) => player.available && player.load < 86)
    .sort((a, b) => b.form + b.attendance - (a.form + a.attendance));

  formations[state.formation] = formations[state.formation].map(([id, x, y]) => {
    if (!unavailableIds.has(id)) return [id, x, y];
    const replacement = candidate.find((player) => !lineupIds().includes(player.id) && player.pos === state.players.find((item) => item.id === id)?.pos);
    return replacement ? [replacement.id, x, y] : [id, x, y];
  });

  persist();
  renderAll();
  showToast("Once revisado con bajas y cargas");
}

function addDrill() {
  const pool = [
    { title: "Salida de balon ante presion", minutes: 16, type: "Tactico", day: "Mar" },
    { title: "Transiciones 6v4", minutes: 14, type: "Alta", day: "Jue" },
    { title: "Rondo orientado", minutes: 12, type: "Base", day: "Lun" },
    { title: "Centros y remate", minutes: 18, type: "Tactico", day: "Vie" },
  ];
  state.drills = [...state.drills, pool[state.drills.length % pool.length]];
  persist();
  renderDrills();
  showToast("Bloque anadido");
}

function openPlayer(id) {
  const player = state.players.find((item) => item.id === id);
  selectedPlayerId = id;
  document.querySelector("#sheetAvatar").textContent = initials(player.name);
  document.querySelector("#sheetPosition").textContent = player.pos;
  document.querySelector("#sheetName").textContent = player.name;
  document.querySelector("#sheetStatus").textContent = statusFor(player);
  document.querySelector("#sheetAttendance").value = player.attendance;
  document.querySelector("#sheetLoad").value = player.load;
  document.querySelector("#sheetForm").value = player.form;
  document.querySelector("#sheetAvailable").checked = player.available;
  syncSheetLabels();
  els.playerDialog.showModal();
}

function syncSheetLabels() {
  document.querySelector("#sheetAttendanceValue").textContent = `${document.querySelector("#sheetAttendance").value}%`;
  document.querySelector("#sheetLoadValue").textContent = `${document.querySelector("#sheetLoad").value}%`;
  document.querySelector("#sheetFormValue").textContent = `${document.querySelector("#sheetForm").value}%`;
}

function savePlayerSheet() {
  const player = state.players.find((item) => item.id === selectedPlayerId);
  if (!player) return;

  player.attendance = Number(document.querySelector("#sheetAttendance").value);
  player.load = Number(document.querySelector("#sheetLoad").value);
  player.form = Number(document.querySelector("#sheetForm").value);
  player.available = document.querySelector("#sheetAvailable").checked;
  player.status = statusFor(player);
  persist();
  renderAll();
  showToast(`${player.name} actualizado`);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function renderAll() {
  els.intensityRange.value = state.intensity;
  els.intensityLabel.textContent = `${state.intensity}%`;
  document.querySelectorAll(".formation").forEach((button) => {
    button.classList.toggle("active", button.dataset.formation === state.formation);
  });
  renderMetrics();
  renderPlayers();
  renderLineup();
  renderInsights();
  renderDrills();
  renderFinances();
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

document.querySelectorAll(".formation").forEach((button) => {
  button.addEventListener("click", () => setFormation(button.dataset.formation));
});

els.searchInput.addEventListener("input", renderPlayers);
els.positionFilter.addEventListener("change", renderPlayers);
document.querySelector("#exportButton").addEventListener("click", generateReport);
document.querySelector("#optimizeLineup").addEventListener("click", optimizeLineup);
document.querySelector("#addDrill").addEventListener("click", addDrill);

els.intensityRange.addEventListener("input", () => {
  state.intensity = Number(els.intensityRange.value);
  els.intensityLabel.textContent = `${state.intensity}%`;
  persist();
});

els.financeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const concept = document.querySelector("#financeConcept").value.trim();
  const rawAmount = Number(document.querySelector("#financeAmount").value);
  if (!concept || Number.isNaN(rawAmount)) return;

  const sign = els.financeType.value === "income" ? 1 : -1;
  state.finances = [...state.finances, { concept, amount: Math.abs(rawAmount) * sign }];
  els.financeForm.reset();
  persist();
  renderAll();
  showToast("Movimiento guardado");
});

document.querySelector("#resetData").addEventListener("click", () => {
  state = getDefaultState();
  localStorage.removeItem(storageKey);
  renderAll();
  showToast("Demo reiniciada");
});

["#sheetAttendance", "#sheetLoad", "#sheetForm"].forEach((selector) => {
  document.querySelector(selector).addEventListener("input", syncSheetLabels);
});

document.querySelector("#savePlayer").addEventListener("click", savePlayerSheet);

renderAll();
