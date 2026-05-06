import { useState, useEffect, useCallback } from "react";

const BRANDS = [
  { id: "gc", name: "Global Cruises LLC", short: "Global Cruises", color: "#185FA5", bg: "#E6F1FB", text: "#0C447C", icon: "ti-ship" },
  { id: "kp", name: "KUZÁ PARK (GLOBAL MX)", short: "KUZÁ PARK", color: "#0F6E56", bg: "#E1F5EE", text: "#085041", icon: "ti-trees" },
  { id: "ag", name: "Adventugram", short: "Adventugram", color: "#854F0B", bg: "#FAEEDA", text: "#633806", icon: "ti-map-2" },
];

const initMember = (i) => ({
  id: i,
  name: "",
  role: "",
  brands: { gc: { active: false, scope: "" }, kp: { active: false, scope: "" }, ag: { active: false, scope: "" } },
});

const initMembers = () => Array.from({ length: 18 }, (_, i) => initMember(i + 1));

const STORAGE_KEY = "mkt-alcances-v1";

const getInitials = (name) => {
  if (!name.trim()) return "?";
  return name.trim().split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const AVATAR_COLORS = [
  { bg: "#EEEDFE", text: "#3C3489" }, { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAECE7", text: "#712B13" }, { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#FAEEDA", text: "#633806" }, { bg: "#EAF3DE", text: "#27500A" },
];

export default function App() {
  const [members, setMembers] = useState(initMembers);
  const [view, setView] = useState("edit");
  const [editIdx, setEditIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [brandView, setBrandView] = useState("gc");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) setMembers(JSON.parse(r.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (data) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); setSaved(true); setTimeout(() => setSaved(false), 1500); } catch {}
  }, []);

  const updateMember = (idx, field, val) => {
    setMembers((prev) => { const n = [...prev]; n[idx] = { ...n[idx], [field]: val }; return n; });
  };

  const updateBrand = (idx, bid, field, val) => {
    setMembers((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], brands: { ...n[idx].brands, [bid]: { ...n[idx].brands[bid], [field]: val } } };
      return n;
    });
  };

  const cur = members[editIdx] || members[0];
  const filledCount = members.filter((m) => m.name.trim()).length;

  const brandStats = BRANDS.map((b) => ({
    ...b,
    members: members.filter((m) => m.name.trim() && m.brands[b.id]?.active),
  }));

  if (!loaded) return <div style={{ padding: "2rem", color: "var(--color-text-secondary)", fontSize: 14 }}>Cargando...</div>;

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      <h2 className="sr-only">Gestor de alcances del equipo de marketing</h2>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-secondary)", textTransform: "uppercase", margin: "0 0 4px" }}>Equipo de Marketing</p>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-primary)" }}>Alcances por marca</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          {filledCount}/18 integrantes configurados
        </p>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "1rem" }}>
        {[{ id: "edit", label: "Editar datos", icon: "ti-pencil" }, { id: "team", label: "Por persona", icon: "ti-users" }, { id: "brands", label: "Por marca", icon: "ti-flag" }].map((tab) => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{
            padding: "6px 14px", fontSize: 13, border: "0.5px solid",
            borderColor: view === tab.id ? "var(--color-border-primary)" : "var(--color-border-tertiary)",
            background: view === tab.id ? "var(--color-background-secondary)" : "transparent",
            borderRadius: "var(--border-radius-md)", cursor: "pointer",
            color: view === tab.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            fontWeight: view === tab.id ? 500 : 400, display: "flex", alignItems: "center", gap: 6,
          }}>
            <i className={`ti ${tab.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
        <button onClick={() => save(members)} style={{
          marginLeft: "auto", padding: "6px 14px", fontSize: 13,
          border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)",
          background: saved ? "var(--color-background-success)" : "transparent",
          color: saved ? "var(--color-text-success)" : "var(--color-text-secondary)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <i className={`ti ${saved ? "ti-check" : "ti-device-floppy"}`} style={{ fontSize: 14 }} aria-hidden="true" />
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {/* EDIT VIEW */}
      {view === "edit" && (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1.5rem" }}>
          {/* Member list sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {members.map((m, i) => {
              const brandCount = BRANDS.filter((b) => m.brands[b.id]?.active).length;
              const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <button key={m.id} onClick={() => setEditIdx(i)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  border: "0.5px solid", borderColor: editIdx === i ? "var(--color-border-primary)" : "var(--color-border-tertiary)",
                  background: editIdx === i ? "var(--color-background-secondary)" : "transparent",
                  borderRadius: "var(--border-radius-md)", cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: av.bg, color: av.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
                    {getInitials(m.name) || i + 1}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.name || `Persona ${i + 1}`}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>
                      {brandCount > 0 ? `${brandCount} marca${brandCount > 1 ? "s" : ""}` : "Sin marcas"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Edit form */}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
            <p style={{ margin: "0 0 1rem", fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500 }}>Persona {editIdx + 1} de 18</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Nombre completo</label>
                <input value={cur.name} onChange={(e) => updateMember(editIdx, "name", e.target.value)} placeholder="Ej. María García" style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Cargo / Rol</label>
                <input value={cur.role} onChange={(e) => updateMember(editIdx, "role", e.target.value)} placeholder="Ej. Social Media Manager" style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "1.25rem" }}>
              <p style={{ margin: "0 0 1rem", fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Alcances por marca</p>
              {BRANDS.map((b) => {
                const bd = cur.brands[b.id];
                return (
                  <div key={b.id} style={{ marginBottom: "1rem", border: `0.5px solid ${bd.active ? b.color : "var(--color-border-tertiary)"}`, borderRadius: "var(--border-radius-md)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: bd.active ? b.bg : "transparent", cursor: "pointer" }} onClick={() => updateBrand(editIdx, b.id, "active", !bd.active)}>
                      <div style={{ width: 18, height: 18, border: `1.5px solid ${bd.active ? b.color : "var(--color-border-secondary)"}`, borderRadius: 4, background: bd.active ? b.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {bd.active && <i className="ti ti-check" style={{ fontSize: 11, color: "#fff" }} aria-hidden="true" />}
                      </div>
                      <i className={`ti ${b.icon}`} style={{ fontSize: 15, color: bd.active ? b.color : "var(--color-text-secondary)" }} aria-hidden="true" />
                      <span style={{ fontSize: 13, fontWeight: 500, color: bd.active ? b.text : "var(--color-text-secondary)" }}>{b.name}</span>
                    </div>
                    {bd.active && (
                      <div style={{ padding: "10px 12px", borderTop: `0.5px solid ${b.color}22` }}>
                        <label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Alcance / responsabilidades en esta marca</label>
                        <textarea value={bd.scope} onChange={(e) => updateBrand(editIdx, b.id, "scope", e.target.value)} placeholder="Ej. Gestión de redes sociales, contenido orgánico, campañas de paid media..." rows={3} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: 13 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
              <button onClick={() => setEditIdx(Math.max(0, editIdx - 1))} disabled={editIdx === 0} style={{ padding: "7px 14px", fontSize: 13 }}>
                <i className="ti ti-arrow-left" style={{ fontSize: 14 }} aria-hidden="true" /> Anterior
              </button>
              <button onClick={() => setEditIdx(Math.min(17, editIdx + 1))} disabled={editIdx === 17} style={{ padding: "7px 14px", fontSize: 13 }}>
                Siguiente <i className="ti ti-arrow-right" style={{ fontSize: 14 }} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEAM VIEW */}
      {view === "team" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: "1.5rem" }}>
            {brandStats.map((b) => (
              <div key={b.id} style={{ background: b.bg, borderRadius: "var(--border-radius-md)", padding: "10px 14px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: b.text, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                  <i className={`ti ${b.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />{b.short}
                </p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color: b.text }}>{b.members.length}</p>
                <p style={{ margin: 0, fontSize: 11, color: b.color }}>personas asignadas</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {members.filter((m) => m.name.trim()).map((m, i) => {
              const av = AVATAR_COLORS[members.indexOf(m) % AVATAR_COLORS.length];
              const activeBrands = BRANDS.filter((b) => m.brands[b.id]?.active);
              return (
                <div key={m.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: av.bg, color: av.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                      {getInitials(m.name)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{m.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{m.role || "Sin cargo"}</p>
                    </div>
                  </div>

                  {activeBrands.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0, fontStyle: "italic" }}>Sin marcas asignadas</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {activeBrands.map((b) => (
                        <div key={b.id} style={{ borderLeft: `3px solid ${b.color}`, paddingLeft: 10 }}>
                          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 500, color: b.text, display: "flex", alignItems: "center", gap: 4 }}>
                            <i className={`ti ${b.icon}`} style={{ fontSize: 12 }} aria-hidden="true" />{b.short}
                          </p>
                          {m.brands[b.id]?.scope ? (
                            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{m.brands[b.id].scope}</p>
                          ) : (
                            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>Alcance no especificado</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {members.filter((m) => m.name.trim()).length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-tertiary)" }}>
              <i className="ti ti-users" style={{ fontSize: 32, display: "block", marginBottom: "0.75rem" }} aria-hidden="true" />
              <p style={{ margin: 0, fontSize: 14 }}>Aún no hay integrantes configurados. Ve a "Editar datos" para comenzar.</p>
            </div>
          )}
        </div>
      )}

      {/* BRANDS VIEW */}
      {view === "brands" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
            {BRANDS.map((b) => (
              <button key={b.id} onClick={() => setBrandView(b.id)} style={{
                padding: "7px 14px", fontSize: 13, border: "0.5px solid",
                borderColor: brandView === b.id ? b.color : "var(--color-border-tertiary)",
                background: brandView === b.id ? b.bg : "transparent",
                borderRadius: "var(--border-radius-md)", cursor: "pointer",
                color: brandView === b.id ? b.text : "var(--color-text-secondary)",
                fontWeight: brandView === b.id ? 500 : 400, display: "flex", alignItems: "center", gap: 6,
              }}>
                <i className={`ti ${b.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />{b.short}
              </button>
            ))}
          </div>

          {BRANDS.filter((b) => b.id === brandView).map((b) => {
            const bMembers = members.filter((m) => m.name.trim() && m.brands[b.id]?.active);
            return (
              <div key={b.id}>
                <div style={{ background: b.bg, border: `0.5px solid ${b.color}44`, borderRadius: "var(--border-radius-lg)", padding: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "var(--border-radius-md)", background: b.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className={`ti ${b.icon}`} style={{ fontSize: 22, color: "#fff" }} aria-hidden="true" />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 500, color: b.text }}>{b.name}</p>
                    <p style={{ margin: 0, fontSize: 13, color: b.color }}>{bMembers.length} integrante{bMembers.length !== 1 ? "s" : ""} asignado{bMembers.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {bMembers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-tertiary)", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)" }}>
                    <p style={{ margin: 0, fontSize: 14 }}>Ningún integrante asignado a esta marca todavía.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {bMembers.map((m, i) => {
                      const av = AVATAR_COLORS[members.indexOf(m) % AVATAR_COLORS.length];
                      const otherBrands = BRANDS.filter((ob) => ob.id !== b.id && m.brands[ob.id]?.active);
                      return (
                        <div key={m.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "start" }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: av.bg, color: av.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0, marginTop: 2 }}>
                            {getInitials(m.name)}
                          </div>
                          <div>
                            <p style={{ margin: "0 0 1px", fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{m.name}</p>
                            <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-text-secondary)" }}>{m.role || "Sin cargo"}</p>
                            {m.brands[b.id]?.scope ? (
                              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, background: b.bg, padding: "8px 12px", borderRadius: "var(--border-radius-md)", borderLeft: `3px solid ${b.color}` }}>
                                {m.brands[b.id].scope}
                              </p>
                            ) : (
                              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>Alcance no especificado</p>
                            )}
                          </div>
                          {otherBrands.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                              <p style={{ margin: "0 0 4px", fontSize: 10, color: "var(--color-text-tertiary)" }}>También en</p>
                              {otherBrands.map((ob) => (
                                <span key={ob.id} style={{ fontSize: 11, padding: "2px 8px", background: ob.bg, color: ob.text, borderRadius: "var(--border-radius-md)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                  <i className={`ti ${ob.icon}`} style={{ fontSize: 11 }} aria-hidden="true" />{ob.short}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
