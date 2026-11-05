// Step 1 runs the Smart Gate. BLOCKED guests stop before dates and are not saved.
let gate = null,
  step1Data = null;
const $ = (id) => document.getElementById(id);
$("step1").addEventListener("submit", (event) => {
  event.preventDefault();
  step1Data = {
    guestType: $("guestType").value,
    men: $("men").value,
    women: $("women").value,
    children: $("children").value,
    purpose: $("purpose").value,
  };
  gate = classifyBooking({ ...step1Data, maxGuests: SITE.maxGuests });
  const box = $("gateResult");
  box.style.display = "block";
  if (gate.status === "BLOCKED") {
    box.className = "result block";
    box.textContent = gate.message;
    $("step2").style.display = "none";
    $("step1").style.display = "none";
    document.querySelector(".booking-aside").style.display = "none";
    document.querySelector(".progress-track").style.display = "none";
    document.querySelector(".progress-label").style.display = "none";
    return;
  }
  if (gate.status === "INVALID") {
    box.className = "result review";
    box.textContent = gate.message;
    return;
  }
  box.className = "result " + (gate.status === "REVIEW" ? "review" : "ok");
  box.textContent =
    gate.status === "REVIEW"
      ? "Manual review needed. " + gate.message
      : gate.message;
  $("step2").style.display = "block";
  $("progressLabel").textContent = "02 — YOUR DATES & DETAILS";
  document.querySelector(".progress-active").style.flex = "2";
  $("step2").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("step2").addEventListener("submit", (event) => {
  event.preventDefault();
  if (
    !step1Data ||
    !gate ||
    gate.status === "INVALID" ||
    gate.status === "BLOCKED"
  ) {
    const box = $("sentResult");
    box.style.display = "block";
    box.textContent =
      "Please complete the guest profile before sending a request.";
    return;
  }
  if (
    !$("checkin").value ||
    !$("checkout").value ||
    $("checkout").value <= $("checkin").value
  ) {
    $("checkout").setCustomValidity("Check-out must be after check-in.");
    $("checkout").reportValidity();
    $("checkout").setCustomValidity("");
    return;
  }
  const request = {
    id: "KT-" + Date.now().toString().slice(-6),
    time: new Date().toLocaleString("en-IN"),
    ...step1Data,
    gateStatus: gate.status,
    gateReason: gate.reason,
    checkin: $("checkin").value,
    checkout: $("checkout").value,
    name: $("gname").value,
    phone: $("gphone").value,
    guests: $("glist").value,
    idType: $("gid").value,
    ownerStatus: "PENDING OWNER APPROVAL",
  };
  let requests;
  try {
    const stored = JSON.parse(localStorage.getItem("kt_requests") || "[]");
    requests = Array.isArray(stored) ? stored : [];
  } catch {
    requests = [];
  }
  requests.unshift(request);
  localStorage.setItem("kt_requests", JSON.stringify(requests));
  const box = $("sentResult");
  box.style.display = "block";
  box.textContent = `Request sent! (Ref: ${request.id}) The owner will reply on WhatsApp within ${SITE.approvalHours} hours. Your payment link will be shared only after approval. No payment has been taken.`;
  $("step1").style.display = "none";
  $("step2").style.display = "none";
  box.scrollIntoView({ behavior: "smooth", block: "center" });
});
const bookingContact = document.getElementById("bookingContact");
if (bookingContact)
  bookingContact.textContent = "Owner WhatsApp: " + SITE.whatsapp;
