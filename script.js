const ICONS = {
  Gaming: "🎮",
  "Social Media": "📱",
  "Watching Videos": "📺",
  "Browsing the Web": "🌐",
  "Drinking / Partying": "🍺",
  "Online Shopping": "🛍",
  "Doomscrolling News": "📰",
};
const BAR_COLORS = ["bc0", "bc1", "bc2", "bc3", "bc4", "bc5"];

let activities = [];
let grandTotal = 0;

function handleActivityChange() {
  const v = document.getElementById("activitySelect").value;
  document
    .getElementById("customNameWrap")
    .classList.toggle("show", v === "custom");
}

function dailyTotal() {
  return activities.reduce((s, a) => s + a.hoursPerDay, 0);
}

function updateMeter() {
  const used = dailyTotal();
  const pct = Math.min((used / 24) * 100, 100);
  const remaining = Math.max(24 - used, 0);

  const fill = document.getElementById("meterFill");
  const count = document.getElementById("meterCount");
  const msg = document.getElementById("meterMsg");
  const meter = document.getElementById("dayMeter");
  const addBtn = document.getElementById("addBtn");

  fill.style.width = pct + "%";
  count.textContent = used.toFixed(1) + " / 24h";

  // Clear all state classes
  fill.className = "day-meter-fill";
  count.className = "day-meter-count";
  meter.className = "day-meter";
  msg.className = "day-meter-msg";

  if (used >= 24) {
    fill.classList.add("full");
    count.classList.add("full");
    meter.classList.add("full");
    msg.classList.add("full");
    msg.textContent =
      "⛔ You've filled all 24 hours. Remove an activity to add more.";
    addBtn.disabled = true;
  } else if (used >= 18) {
    fill.classList.add("warning");
    count.classList.add("warning");
    meter.classList.add("warning");
    msg.classList.add("warning");
    msg.textContent = `⚠️ Only ${remaining.toFixed(
      1
    )}h left in your day. You can still add more.`;
    addBtn.disabled = false;
  } else if (used > 0) {
    fill.classList.add("ok");
    count.classList.add("ok");
    msg.textContent = `${remaining.toFixed(1)}h remaining in your day.`;
    addBtn.disabled = false;
  } else {
    count.classList.add("ok");
    msg.textContent =
      "Add activities to see how much of your day they consume.";
    addBtn.disabled = false;
  }
}

function addActivity() {
  const sel = document.getElementById("activitySelect").value;
  const h = parseFloat(document.getElementById("hoursPerDay").value);
  const y = parseFloat(document.getElementById("years").value);
  if (!h || !y || h <= 0 || y <= 0) {
    shakeCard();
    return;
  }

  // 24h cap check
  const used = dailyTotal();
  const remaining = 24 - used;
  if (h > remaining) {
    // Clamp and show error
    showDayError(remaining);
    return;
  }

  const name =
    sel === "custom"
      ? document.getElementById("customName").value.trim() || "Custom Activity"
      : sel;
  const icon = ICONS[name] || "✦";
  const totalHours = h * 365 * y;

  activities.push({ name, icon, hoursPerDay: h, years: y, totalHours });
  renderList();
  updateMeter();

  // Reset
  document.getElementById("hoursPerDay").value = "";
  document.getElementById("years").value = "";
  document.getElementById("customName").value = "";
  document.getElementById("customNameWrap").classList.remove("show");
  document.getElementById("activitySelect").value = "Gaming";
  document.getElementById("hoursPerDay").focus();
}

function showDayError(remaining) {
  const msg = document.getElementById("meterMsg");
  const meter = document.getElementById("dayMeter");
  const hInput = document.getElementById("hoursPerDay");

  // Flash the meter
  meter.style.transition = "none";
  meter.style.borderColor = "rgba(255,60,60,0.8)";
  setTimeout(() => {
    meter.style.transition = "";
    meter.style.borderColor = "";
    updateMeter();
  }, 1200);

  if (remaining <= 0) {
    msg.textContent = "⛔ No hours left! You've already filled all 24 hours.";
  } else {
    msg.textContent = `⛔ That exceeds your daily limit! Max you can add: ${remaining.toFixed(
      1
    )}h`;
    // Highlight the input
    hInput.style.borderColor = "var(--accent)";
    hInput.style.boxShadow = "0 0 0 3px rgba(255,60,60,0.2)";
    setTimeout(() => {
      hInput.style.borderColor = "";
      hInput.style.boxShadow = "";
    }, 1200);
  }
  msg.className = "day-meter-msg full";
  shakeCard();
}

function removeActivity(i) {
  activities.splice(i, 1);
  renderList();
  updateMeter();
}

function renderList() {
  const list = document.getElementById("activityList");
  const hint = document.getElementById("emptyHint");
  const btn = document.getElementById("calcBtn");

  hint.classList.toggle("show", activities.length === 0);
  btn.disabled = activities.length === 0;

  list.innerHTML = activities
    .map(
      (a, i) => `
      <div class="activity-item">
        <div class="ai-icon">${a.icon}</div>
        <div class="ai-info">
          <div class="ai-name">${esc(a.name)}</div>
          <div class="ai-meta">${a.hoursPerDay}h/day · ${a.years} yr${
        a.years !== 1 ? "s" : ""
      }</div>
        </div>
        <div class="ai-hrs">${Math.round(
          a.totalHours
        ).toLocaleString()}<span style="font-size:14px;color:var(--muted);font-family:'DM Mono',monospace"> hrs</span></div>
        <button class="ai-remove" onclick="removeActivity(${i})" title="Remove">×</button>
      </div>
    `
    )
    .join("");
}

function calculate() {
  if (!activities.length) return;

  grandTotal = activities.reduce((s, a) => s + a.totalHours, 0);
  const money = grandTotal * 15;
  const skills = grandTotal / 10000;
  const projects = Math.floor(grandTotal / 20);
  const totalHPD = activities.reduce((s, a) => s + a.hoursPerDay, 0);
  const lifeHours = totalHPD * 365 * 40;
  const lifePct = Math.min((lifeHours / (80 * 365 * 16)) * 100, 100);

  document.getElementById("formSection").style.display = "none";
  const res = document.getElementById("results");
  res.style.display = "block";
  res.classList.add("visible");

  animateCount(document.getElementById("bigHours"), grandTotal, "", "", 1600);
  renderBreakdown();

  setTimeout(
    () =>
      animateCount(document.getElementById("moneyVal"), money, "$", "", 1400),
    300
  );

  setTimeout(() => {
    const el = document.getElementById("skillsVal");
    if (skills >= 1) {
      animateCount(el, Math.floor(skills), "", "", 1400);
      document.getElementById("skillsLabel").textContent = `${Math.floor(
        skills
      )} skill${Math.floor(skills) !== 1 ? "s" : ""} mastered.`;
    } else {
      el.textContent = (skills * 100).toFixed(0) + "%";
      document.getElementById("skillsLabel").textContent = `${(
        skills * 100
      ).toFixed(0)}% toward mastery.`;
    }
  }, 500);

  setTimeout(
    () =>
      animateCount(
        document.getElementById("projectsVal"),
        projects,
        "",
        "",
        1400
      ),
    650
  );

  setTimeout(() => {
    animateCount(document.getElementById("lifeVal"), lifeHours, "", "", 1400);
    setTimeout(() => {
      document.getElementById("lifeBar").style.width = lifePct + "%";
      let p = 0;
      const pctEl = document.getElementById("lifePct");
      const iv = setInterval(() => {
        p = Math.min(p + lifePct / 60, lifePct);
        pctEl.textContent = p.toFixed(1) + "% of waking life";
        if (p >= lifePct) clearInterval(iv);
      }, 20);
    }, 100);
  }, 800);

  setWakeMessage(grandTotal);
  setTimeout(
    () => res.scrollIntoView({ behavior: "smooth", block: "start" }),
    200
  );
}

function renderBreakdown() {
  const max = Math.max(...activities.map((a) => a.totalHours));
  document.getElementById("breakdownList").innerHTML = activities
    .map(
      (a, i) => `
      <div class="breakdown-row" style="animation-delay:${i * 0.07}s">
        <div class="br-icon">${a.icon}</div>
        <div class="br-name">${esc(a.name)}</div>
        <div class="br-bar-wrap"><div class="br-bar ${
          BAR_COLORS[i % BAR_COLORS.length]
        }" id="bb${i}"></div></div>
        <div class="br-hrs">${Math.round(
          a.totalHours
        ).toLocaleString()} hrs</div>
      </div>
    `
    )
    .join("");
  setTimeout(() => {
    activities.forEach((a, i) => {
      const el = document.getElementById("bb" + i);
      if (el) el.style.width = (a.totalHours / max) * 100 + "%";
    });
  }, 400);
}

function setWakeMessage(hours) {
  const names = activities.map((a) => a.name).join(", ");
  const msgs = [
    {
      test: (h) => h > 20000,
      title: "You have spent years of your life.",
      text: `${fmt(hours)} hours on ${names}. That's ${(hours / 8760).toFixed(
        1
      )} years of full-time living. What changes if just 10% is redirected?`,
      quote: '"YOU DO NOT RISE TO YOUR GOALS. YOU FALL TO YOUR HABITS."',
    },
    {
      test: (h) => h > 5000,
      title: "Thousands of hours. Gone.",
      text: `${fmt(hours)} hours across ${
        activities.length
      } activities. In the same time, someone built a company, learned 3 languages, or wrote a novel.`,
      quote: '"TIME IS THE ONLY RESOURCE YOU CAN NEVER EARN BACK."',
    },
    {
      test: (h) => h > 1000,
      title: "This is your wake-up call.",
      text: `${fmt(
        hours
      )} hours on ${names}. Every hour is a vote for who you are becoming. Who are you becoming?`,
      quote: '"LOST TIME IS NEVER FOUND AGAIN." — BENJAMIN FRANKLIN',
    },
    {
      test: () => true,
      title: "It's not too late. Yet.",
      text: `${fmt(
        hours
      )} hours on ${names}. The best time to redirect your time was yesterday. The second best time is right now.`,
      quote: '"SOMEDAY IS NOT A DAY OF THE WEEK."',
    },
  ];
  const m = msgs.find((m) => m.test(hours));
  document.getElementById("wakeTitle").textContent = m.title;
  document.getElementById("wakeText").textContent = m.text;
  document.getElementById("wakeQuote").textContent = m.quote;
}

function shareResult() {
  const lines = activities
    .map((a) => `  ${a.icon} ${a.name}: ${fmt(a.totalHours)} hrs`)
    .join("\n");
  const money = fmt(Math.round(grandTotal * 15));
  const skills = grandTotal / 10000;
  const skillText =
    skills >= 1
      ? `mastering ${Math.floor(skills)} skill${
          Math.floor(skills) !== 1 ? "s" : ""
        }`
      : `getting ${(skills * 100).toFixed(0)}% toward mastery`;
  const projects = fmt(Math.floor(grandTotal / 20));
  const text = `I spent ${fmt(
    grandTotal
  )} hours on:\n${lines}\n\nThat could have been:\n💰 $${money} in potential earnings\n🧠 ${skillText}\n🔨 ${projects} projects built\n\nCheck where your time went → whereyourtimewent.com`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(showToast);
  else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast();
  }
}

function showToast() {
  const t = document.getElementById("shareToast");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function recalculate() {
  document.getElementById("results").style.display = "none";
  document.getElementById("results").classList.remove("visible");
  document.getElementById("formSection").style.display = "block";
  document.getElementById("lifeBar").style.width = "0%";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function animateCount(el, target, prefix, suffix, duration) {
  const start = performance.now();
  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent =
      (prefix || "") +
      Math.floor(target * ease(p)).toLocaleString() +
      (suffix || "");
    if (p < 1) requestAnimationFrame(tick);
    else
      el.textContent =
        (prefix || "") + Math.round(target).toLocaleString() + (suffix || "");
  })(start);
}

function shakeCard() {
  const c = document.querySelector(".form-card");
  [
    [-8, 0],
    [8, 80],
    [-5, 160],
    [5, 240],
    [0, 320],
  ].forEach(([x, t]) =>
    setTimeout(() => (c.style.transform = `translateX(${x}px)`), t)
  );
}

function fmt(n) {
  return Math.round(n).toLocaleString();
}
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    document.getElementById("formSection").style.display !== "none"
  ) {
    const h = document.getElementById("hoursPerDay").value;
    const y = document.getElementById("years").value;
    if (h && y) addActivity();
  }
});
