let totalHours = 0;
let activityName = "Gaming";

function animateCount(
  el,
  target,
  prefix = "",
  suffix = "",
  duration = 1400,
  decimals = 0
) {
  const start = performance.now();
  const startVal = 0;
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = startVal + (target - startVal) * easeOut(progress);
    const formatted =
      decimals > 0
        ? current.toFixed(decimals)
        : Math.floor(current).toLocaleString();
    el.textContent = prefix + formatted + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else
      el.textContent =
        prefix +
        (decimals > 0
          ? target.toFixed(decimals)
          : Math.round(target).toLocaleString()) +
        suffix;
  }
  requestAnimationFrame(update);
}

function calculate() {
  const h = parseFloat(document.getElementById("hoursPerDay").value);
  const y = parseFloat(document.getElementById("years").value);
  activityName = document.getElementById("activity").value;

  if (!h || !y || h <= 0 || y <= 0) {
    shakeForm();
    return;
  }

  totalHours = h * 365 * y;
  const money = totalHours * 15;
  const skills = totalHours / 10000;
  const projects = Math.floor(totalHours / 20);
  const lifeHours = h * 365 * 40;
  // waking hours in life = 80 years * 365 * 16hrs awake
  const wakingLifeHours = 80 * 365 * 16;
  const lifePct = Math.min((lifeHours / wakingLifeHours) * 100, 100);

  // Hide form, show results
  document.getElementById("formSection").style.display = "none";
  const results = document.getElementById("results");
  results.style.display = "block";
  results.classList.add("visible");

  // Set badge
  const icons = {
    Gaming: "🎮",
    "Social Media": "📱",
    "Watching Videos": "📺",
    Other: "✦",
  };
  document.getElementById("activityBadge").textContent =
    (icons[activityName] || "✦") + " on " + activityName;

  // Animate big number
  const bigEl = document.getElementById("bigHours");
  animateCount(bigEl, totalHours, "", "", 1600);

  // Cards
  setTimeout(() => {
    animateCount(document.getElementById("moneyVal"), money, "$", "", 1400);
  }, 300);

  setTimeout(() => {
    const skillsEl = document.getElementById("skillsVal");
    if (skills >= 1) {
      animateCount(skillsEl, Math.floor(skills), "", "", 1400);
      document.getElementById("skillsLabel").textContent =
        skills >= 2
          ? `${Math.floor(skills)} skills mastered.`
          : "1 skill mastered.";
    } else {
      const pct = (skills * 100).toFixed(0);
      skillsEl.textContent = pct + "%";
      document.getElementById(
        "skillsLabel"
      ).textContent = `${pct}% toward mastery.`;
    }
  }, 500);

  setTimeout(() => {
    animateCount(
      document.getElementById("projectsVal"),
      projects,
      "",
      "",
      1400
    );
  }, 650);

  setTimeout(() => {
    animateCount(document.getElementById("lifeVal"), lifeHours, "", "", 1400);
    setTimeout(() => {
      document.getElementById("lifeBar").style.width = lifePct + "%";
      const pctEl = document.getElementById("lifePct");
      let p = 0;
      const interval = setInterval(() => {
        p += lifePct / 60;
        if (p >= lifePct) {
          p = lifePct;
          clearInterval(interval);
        }
        pctEl.textContent = p.toFixed(1) + "% of waking life";
      }, 20);
    }, 100);
  }, 800);

  // Wake-up message
  setWakeMessage(totalHours, activityName);

  // Scroll to results
  setTimeout(() => {
    document
      .getElementById("results")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

function setWakeMessage(hours, activity) {
  const title = document.getElementById("wakeTitle");
  const text = document.getElementById("wakeText");
  const quote = document.getElementById("wakeQuote");

  const msgs = [
    {
      test: (h) => h > 20000,
      title: "You have spent years of your life.",
      text: `${Math.round(
        hours
      ).toLocaleString()} hours on ${activity}. That's equivalent to ${(
        hours / 8760
      ).toFixed(
        1
      )} years of full-time living. What could have changed if just 10% of that time was redirected?`,
      quote:
        '"YOU DO NOT RISE TO THE LEVEL OF YOUR GOALS. YOU FALL TO THE LEVEL OF YOUR HABITS."',
    },
    {
      test: (h) => h > 5000,
      title: "Thousands of hours. Gone.",
      text: `${Math.round(
        hours
      ).toLocaleString()} hours on ${activity}. In that same time, someone built a company, learned 3 languages, or ran 500 marathons.`,
      quote:
        '"THE TWO MOST POWERFUL WARRIORS ARE PATIENCE AND TIME." — BUT ONLY WHEN INVESTED.',
    },
    {
      test: (h) => h > 1000,
      title: "This is your wake-up call.",
      text: `${Math.round(
        hours
      ).toLocaleString()} hours on ${activity}. Every hour you spend is a vote for who you are becoming. Who are you becoming?`,
      quote: '"LOST TIME IS NEVER FOUND AGAIN." — BENJAMIN FRANKLIN',
    },
    {
      test: () => true,
      title: "It's not too late. Yet.",
      text: `${Math.round(
        hours
      ).toLocaleString()} hours on ${activity}. The best time to redirect your time was yesterday. The second best time is right now.`,
      quote: '"SOMEDAY IS NOT A DAY OF THE WEEK."',
    },
  ];

  const h = hours;
  const msg = msgs.find((m) => m.test(h));
  title.textContent = msg.title;
  text.textContent = msg.text;
  quote.textContent = msg.quote;
}

function shareResult() {
  const h = Math.round(totalHours).toLocaleString();
  const money = Math.round(totalHours * 15).toLocaleString();
  const skills = totalHours / 10000;
  const projects = Math.floor(totalHours / 20).toLocaleString();

  const skillText =
    skills >= 1
      ? `mastering ${Math.floor(skills)} skill${
          Math.floor(skills) !== 1 ? "s" : ""
        }`
      : `getting ${(skills * 100).toFixed(0)}% toward mastering a skill`;

  const text = `I spent ${h} hours on ${activityName}.\n\nThat could have been:\n💰 $${money} in potential earnings\n🧠 ${skillText}\n🔨 ${projects} projects built\n\nCheck how your time was spent → whereyourtimewent.com`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast());
  } else {
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
  document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function shakeForm() {
  const form = document.getElementById("formSection");
  form.style.animation = "none";
  form.style.transform = "translateX(-8px)";
  setTimeout(() => {
    form.style.transform = "translateX(8px)";
  }, 80);
  setTimeout(() => {
    form.style.transform = "translateX(-5px)";
  }, 160);
  setTimeout(() => {
    form.style.transform = "translateX(5px)";
  }, 240);
  setTimeout(() => {
    form.style.transform = "translateX(0)";
  }, 320);
}

// Enter key support
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    document.getElementById("formSection").style.display !== "none"
  ) {
    calculate();
  }
});
