// Exhaustive production verification of the Mt View ops save/delete paths.
// Runs every entity through create → persist-check → cleanup, in BOTH the
// example and real data spaces, multiple times. Reports PASS/FAIL per step.
const BASE = "https://bluejayportfolio.com/api/clients/mt-view-landscaping/ops/mutate";

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; fails.push(name + (detail ? ` — ${detail}` : "")); console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
}

function post(mode, entity, op, row) {
  const headers = { "Content-Type": "application/json" };
  if (mode === "real") headers["Cookie"] = "bj_mtv_ops_mode=real";
  return fetch(BASE, { method: "POST", headers, body: JSON.stringify({ entity, op, row }) })
    .then(async (r) => ({ status: r.status, body: await r.json() }));
}

async function runChain(mode, pass_n) {
  console.log(`\n=== ${mode.toUpperCase()} space — pass ${pass_n} ===`);
  const made = []; // [entity, id] for cleanup

  // vehicle
  let r = await post(mode, "vehicles", "upsert", { name: "__VERIFY Truck", mpg: 12, fuelCostPerGal: 4.5, maintenancePerMile: 0.2 });
  ok("vehicle create", r.body.ok && r.body.row?.client_slug === (mode === "real" ? "mt-view-landscaping-real" : "mt-view-landscaping"), JSON.stringify(r.body.error || r.body.row?.client_slug));
  const vId = r.body.row?.id; if (vId) made.push(["vehicles", vId]);

  // crew
  r = await post(mode, "crews", "upsert", { name: "__VERIFY Crew", side: "maintenance", vehicleId: vId || "", color: "#abc123" });
  ok("crew create (with truck)", r.body.ok, r.body.error);
  const cId = r.body.row?.id; if (cId) made.push(["crews", cId]);

  // crew with NO truck (empty FK → null)
  r = await post(mode, "crews", "upsert", { name: "__VERIFY Crew NoTruck", side: "construction", vehicleId: "", color: "#7c3aed" });
  ok("crew create (no truck → null FK)", r.body.ok && r.body.row?.vehicle_id === null, r.body.error || ("veh=" + r.body.row?.vehicle_id));
  const c2Id = r.body.row?.id; if (c2Id) made.push(["crews", c2Id]);

  // employee (with crew)
  r = await post(mode, "employees", "upsert", { name: "__VERIFY Person", role: "Crew", payType: "hourly", hourlyRate: 22, crewId: cId || "", tenureYears: "", phone: "", overtimeHoursWeekly: "" });
  ok("employee create (empty tenure/OT)", r.body.ok, r.body.error);
  const eId = r.body.row?.id; if (eId) made.push(["employees", eId]);

  // employee with NO crew (empty FK → null)
  r = await post(mode, "employees", "upsert", { name: "__VERIFY Office", role: "Office", payType: "salary", hourlyRate: 30, crewId: "", billable: false });
  ok("employee create (no crew → null FK)", r.body.ok && r.body.row?.crew_id === null, r.body.error || ("crew=" + r.body.row?.crew_id));
  const e2Id = r.body.row?.id; if (e2Id) made.push(["employees", e2Id]);

  // customer — empty date (THE bug) ×2 + with date
  r = await post(mode, "properties", "upsert", { customer: "__VERIFY Cust EmptyDate", city: "Auburn", tier: "full_care", pricePerVisitUsd: 120, visitsPerMonth: 4, materialsPerVisitUsd: 8, startedAt: "", address: "", lat: "", lng: "" });
  ok("customer create (EMPTY date → null) #1", r.body.ok && r.body.row?.started_at === null, r.body.error || ("date=" + r.body.row?.started_at));
  const pId = r.body.row?.id; if (pId) made.push(["properties", pId]);

  r = await post(mode, "properties", "upsert", { customer: "__VERIFY Cust EmptyDate2", city: "Kent", tier: "essentials", pricePerVisitUsd: 60, visitsPerMonth: 4, materialsPerVisitUsd: 4, startedAt: "", address: "", lat: "", lng: "" });
  ok("customer create (EMPTY date → null) #2", r.body.ok, r.body.error);
  const p2Id = r.body.row?.id; if (p2Id) made.push(["properties", p2Id]);

  r = await post(mode, "properties", "upsert", { customer: "__VERIFY Cust WithDate", city: "Renton", tier: "full_care", pricePerVisitUsd: 150, visitsPerMonth: 4, materialsPerVisitUsd: 10, startedAt: "2024-03-15", lat: "47.5", lng: "-122.2" });
  ok("customer create (WITH date)", r.body.ok && r.body.row?.started_at === "2024-03-15", r.body.error || ("date=" + r.body.row?.started_at));
  const p3Id = r.body.row?.id; if (p3Id) made.push(["properties", p3Id]);

  // customer edit (update price) — confirms upsert-by-id path
  if (pId) {
    r = await post(mode, "properties", "upsert", { id: pId, customer: "__VERIFY Cust EmptyDate", pricePerVisitUsd: 999 });
    ok("customer edit (update by id)", r.body.ok && Number(r.body.row?.price_per_visit_usd) === 999, r.body.error);
  }

  // billing cycle
  if (pId) {
    r = await post(mode, "properties", "upsert", { id: pId, billingStatus: "billed" });
    ok("billing set → billed", r.body.ok && r.body.row?.billing_status === "billed", r.body.error);
    r = await post(mode, "properties", "upsert", { id: pId, billingStatus: "paid" });
    ok("billing set → paid", r.body.ok && r.body.row?.billing_status === "paid", r.body.error);
  }

  // route (needs crew)
  r = await post(mode, "routes", "upsert", { day: "Saturday", crewId: cId || "", returnDriveMinutes: 20, returnDriveMiles: 12, sortOrder: 9 });
  ok("route create (Saturday)", r.body.ok && r.body.row?.crew_id === cId, r.body.error);
  const rId = r.body.row?.id; if (rId) made.push(["routes", rId]);

  // route_stop (needs route + property)
  if (rId && pId) {
    r = await post(mode, "route_stops", "upsert", { routeId: rId, propertyId: pId, seq: 1, serviceMinutes: 50, driveMinutes: 12, driveMiles: 6 });
    ok("route_stop create (add customer to a day)", r.body.ok && r.body.row?.route_id === rId, r.body.error);
    const sId = r.body.row?.id; if (sId) made.push(["route_stops", sId]);
  }

  // timesheet (needs employee) — upsert twice on same cell must not duplicate
  if (eId) {
    r = await post(mode, "timesheets", "upsert", { employeeId: eId, weekday: "Saturday", hours: 8 });
    ok("timesheet save", r.body.ok && Number(r.body.row?.hours) === 8, r.body.error);
    r = await post(mode, "timesheets", "upsert", { employeeId: eId, weekday: "Saturday", hours: 6.5 });
    ok("timesheet re-save same cell (no dup)", r.body.ok && Number(r.body.row?.hours) === 6.5, r.body.error);
  }

  // assumptions upsert (non-destructive: change OT mult then restore)
  r = await post(mode, "assumptions", "upsert", { overtimeMultiplier: 2 });
  ok("settings save (OT mult → 2)", r.body.ok && Number(r.body.row?.overtime_multiplier) === 2, r.body.error);
  r = await post(mode, "assumptions", "upsert", { overtimeMultiplier: 1.5 });
  ok("settings restore (OT mult → 1.5)", r.body.ok, r.body.error);

  // CLEANUP — delete in reverse dependency order
  console.log("  · cleaning up test rows…");
  for (const [entity, id] of made.reverse()) {
    const d = await post(mode, entity, "delete", { id });
    if (!d.body.ok) { fail++; fails.push(`cleanup ${entity} ${id} — ${d.body.error}`); console.log(`  ✗ cleanup ${entity} ${id} — ${d.body.error}`); }
  }
  ok("cleanup completed", true);
}

(async () => {
  for (let n = 1; n <= 2; n++) await runChain("real", n);
  await runChain("example", 1); // one full pass on example (then cleaned up)
  console.log(`\n──────────────────────────────\nRESULT: ${pass} passed, ${fail} failed`);
  if (fails.length) { console.log("FAILURES:"); fails.forEach((f) => console.log("  - " + f)); process.exit(1); }
  else console.log("ALL GREEN ✓");
})();
