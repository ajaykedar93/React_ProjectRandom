import React, { useMemo, useState } from "react";

const API_BASE = "http://localhost:5000";

/**
 * Addtextdoc.jsx (Full)
 * - Many Indian documents (Gov + Private)
 * - Strong validations (no random)
 * - Custom document builder (user adds doc name + custom fields with validation presets)
 * - Preview shown below always
 * - Upload optional
 * - POST to: http://localhost:5000/api/textdocs/upload
 */

export default function Addtextdoc() {
  const PRESETS = useMemo(() => getValidationPresets(), []);
  const DOCS = useMemo(() => getDocDefinitions(PRESETS), [PRESETS]);

  const [docType, setDocType] = useState("AADHAAR");
  const [values, setValues] = useState({});
  const [fileObj, setFileObj] = useState(null);

  // Custom doc builder
  const [customName, setCustomName] = useState("");
  const [customFields, setCustomFields] = useState([
    // default one field
    { key: "field_1", label: "Field 1", preset: "ANY_TEXT_SHORT", required: true },
  ]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // {type,title,message}

  const activeDoc = DOCS.find((d) => d.key === docType);

  const isCustom = docType === "CUSTOM";

  const onChange = (name, value) => {
    setValues((p) => ({ ...p, [name]: value }));
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };
  const closeToast = () => setToast(null);

  const validateCommonFile = () => {
    if (fileObj && fileObj.size > 10 * 1024 * 1024) return "File size must be under 10MB";
    return "";
  };

  const validateBuiltIn = () => {
    for (const f of activeDoc.fields) {
      const v = String(values[f.name] || "").trim();

      if (f.required && !v) return `${f.label} is required`;
      if (v && f.validate) {
        const err = f.validate(v);
        if (err) return err;
      }
    }
    return validateCommonFile();
  };

  const validateCustom = () => {
    const name = customName.trim();
    if (!name) return "Custom Document Name is required";

    // prevent random doc name: require letters + spaces + min length
    if (!/^[A-Za-z][A-Za-z\s().\-]{2,80}$/.test(name)) {
      return "Custom Document Name must be valid (letters/spaces), min 3 characters";
    }

    if (!customFields.length) return "Add at least one field";

    for (const f of customFields) {
      const label = String(f.label || "").trim();
      if (!label) return "Each custom field must have a label";
      if (!/^[A-Za-z][A-Za-z\s().\-]{1,60}$/.test(label)) {
        return `Field label "${label}" is not valid (letters/spaces)`;
      }

      const preset = PRESETS[f.preset];
      if (!preset) return `Invalid preset for "${label}"`;

      const valueKey = `custom__${f.key}`;
      const v = String(values[valueKey] || "").trim();

      if (f.required && !v) return `${label} is required`;
      if (v) {
        const err = preset.validate(v);
        if (err) return `${label}: ${err}`;
      }
    }

    return validateCommonFile();
  };

  const buildPayload = () => {
    if (!isCustom) {
      const fields = {};
      activeDoc.fields.forEach((f) => {
        const v = String(values[f.name] || "").trim();
        if (v) fields[f.name] = v;
      });
      return { doc_type: activeDoc.key, fields };
    }

    // custom doc
    const fields = {};
    fields.document_name = customName.trim();
    customFields.forEach((f) => {
      const key = normalizeKey(f.label);
      const valueKey = `custom__${f.key}`;
      const v = String(values[valueKey] || "").trim();
      if (v) fields[key] = v;
    });

    // store type as CUSTOM + name inside fields
    return { doc_type: "CUSTOM", fields };
  };

  const onSubmit = async () => {
    try {
      setToast(null);

      const err = isCustom ? validateCustom() : validateBuiltIn();
      if (err) {
        showToast("error", "Validation Error", err);
        return;
      }

      setLoading(true);

      const payload = buildPayload();
      const form = new FormData();
      form.append("doc_type", payload.doc_type);
      form.append("fields", JSON.stringify(payload.fields));
      if (fileObj) form.append("file", fileObj);

      const res = await fetch(`${API_BASE}/api/textdocs/upload`, {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Upload failed");

      showToast("success", "Saved", "Document saved successfully");

      // reset values only
      setValues({});
      setFileObj(null);

      // keep custom config (optional) — user asked to “manually add any new doc”
      // so we keep customName/customFields unless you prefer reset.
    } catch (e) {
      showToast("error", "Error", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Custom field builder actions ------------------ */
  const addCustomField = () => {
    const nextIndex = customFields.length + 1;
    setCustomFields((p) => [
      ...p,
      { key: `field_${Date.now()}_${nextIndex}`, label: `Field ${nextIndex}`, preset: "ANY_TEXT_SHORT", required: true },
    ]);
  };

  const removeCustomField = (key) => {
    setCustomFields((p) => p.filter((f) => f.key !== key));
    // also remove values
    setValues((p) => {
      const copy = { ...p };
      delete copy[`custom__${key}`];
      return copy;
    });
  };

  const updateCustomField = (key, patch) => {
    setCustomFields((p) => p.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  };

  /* ------------------ Preview ------------------ */
  const previewLines = useMemo(() => {
    const lines = [];
    if (!isCustom) {
      lines.push(`Document: ${activeDoc.label} (${activeDoc.key})`);
      lines.push(`---`);
      activeDoc.fields.forEach((f) => {
        const v = String(values[f.name] || "").trim();
        if (!v) return;
        lines.push(`${f.label}: ${v}`);
      });
    } else {
      lines.push(`Document: ${customName.trim() || "(Custom Document)"} (CUSTOM)`);
      lines.push(`---`);
      customFields.forEach((f) => {
        const v = String(values[`custom__${f.key}`] || "").trim();
        if (!v) return;
        lines.push(`${f.label}: ${v}`);
      });
    }

    if (fileObj) {
      lines.push(`---`);
      lines.push(`Attachment: ${fileObj.name} • ${fileObj.type || "unknown"} • ${prettyBytes(fileObj.size)}`);
    }
    if (lines.length <= 2) lines.push("(Preview will appear here as you type)");
    return lines.join("\n");
  }, [isCustom, activeDoc, values, fileObj, customName, customFields]);

  return (
    <div className="atd">
      <style>{css}</style>

      {/* Center Toast Modal */}
      {toast && (
        <div className="toastBack" onClick={closeToast}>
          <div className={`toast ${toast.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="toastTitle">{toast.title}</div>
            <div className="toastMsg">{toast.message}</div>
            <button className="toastBtn" type="button" onClick={closeToast}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="head">
          <div>
            <div className="title">Add Document Details</div>
            <div className="sub">
              Government + Private documents • Validations enabled • Upload optional • Preview below
            </div>
          </div>

          <button className="btn" type="button" onClick={onSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="row">
          <label className="lbl">Select Document Type</label>
          <select
            className="input select"
            value={docType}
            onChange={(e) => {
              setDocType(e.target.value);
              setValues({});
              setFileObj(null);
            }}
          >
            {/* Group options for better UX */}
            <optgroup label="Government IDs">
              {DOCS.filter((d) => d.group === "GOV").map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </optgroup>

            <optgroup label="Work & Tax">
              {DOCS.filter((d) => d.group === "WORK_TAX").map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </optgroup>

            <optgroup label="Banking & Finance">
              {DOCS.filter((d) => d.group === "BANK").map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </optgroup>

            <optgroup label="Education & Certificates">
              {DOCS.filter((d) => d.group === "EDU").map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </optgroup>

            <optgroup label="Utilities & Private">
              {DOCS.filter((d) => d.group === "PRIVATE").map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </optgroup>

            <optgroup label="Custom">
              <option value="CUSTOM">Custom (Add your own document)</option>
            </optgroup>
          </select>
        </div>

        {/* Built-in forms */}
        {!isCustom && (
          <div className="grid">
            {activeDoc.fields.map((f) => (
              <div className="field" key={f.name}>
                <label className="lbl">
                  {f.label} {f.required ? <span className="req">*</span> : null}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={values[f.name] || ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    placeholder={f.placeholder || ""}
                  />
                ) : (
                  <input
                    className="input"
                    value={values[f.name] || ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    placeholder={f.placeholder || ""}
                    inputMode={f.inputMode || "text"}
                  />
                )}
                {f.help ? <div className="help">{f.help}</div> : null}
              </div>
            ))}
          </div>
        )}

        {/* Custom doc builder */}
        {isCustom && (
          <div className="customWrap">
            <div className="grid">
              <div className="field">
                <label className="lbl">
                  Custom Document Name <span className="req">*</span>
                </label>
                <input
                  className="input"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Company ID Card, Insurance Policy, Gas Connection..."
                />
                <div className="help">
                  Use a proper name (letters/spaces). This will be saved inside <b>fields.document_name</b>.
                </div>
              </div>
            </div>

            <div className="customHeader">
              <div className="customTitle">Custom Fields</div>
              <button className="btn ghost" type="button" onClick={addCustomField}>
                + Add Field
              </button>
            </div>

            <div className="customList">
              {customFields.map((f, idx) => {
                const valueKey = `custom__${f.key}`;
                const preset = PRESETS[f.preset];

                return (
                  <div className="customCard" key={f.key}>
                    <div className="customRow">
                      <div className="customCol">
                        <label className="lbl">
                          Field Label <span className="req">*</span>
                        </label>
                        <input
                          className="input"
                          value={f.label}
                          onChange={(e) => updateCustomField(f.key, { label: e.target.value })}
                          placeholder={`Field ${idx + 1} label`}
                        />
                      </div>

                      <div className="customCol">
                        <label className="lbl">Validation</label>
                        <select
                          className="input select"
                          value={f.preset}
                          onChange={(e) => updateCustomField(f.key, { preset: e.target.value })}
                        >
                          {Object.entries(PRESETS).map(([k, p]) => (
                            <option key={k} value={k}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="customCol mini">
                        <label className="lbl">Required</label>
                        <select
                          className="input select"
                          value={f.required ? "YES" : "NO"}
                          onChange={(e) => updateCustomField(f.key, { required: e.target.value === "YES" })}
                        >
                          <option value="YES">Yes</option>
                          <option value="NO">No</option>
                        </select>
                      </div>
                    </div>

                    <div className="field">
                      <label className="lbl">
                        {f.label || "Value"} {f.required ? <span className="req">*</span> : null}
                      </label>
                      <input
                        className="input"
                        value={values[valueKey] || ""}
                        onChange={(e) => onChange(valueKey, e.target.value)}
                        placeholder={preset?.placeholder || ""}
                        inputMode={preset?.inputMode || "text"}
                      />
                      <div className="help">{preset?.help}</div>
                    </div>

                    <div className="customActions">
                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => removeCustomField(f.key)}
                        disabled={customFields.length === 1}
                        title={customFields.length === 1 ? "At least 1 field required" : "Remove field"}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload */}
        <div className="row">
          <label className="lbl">Upload File (Optional)</label>
          <input className="input" type="file" onChange={(e) => setFileObj(e.target.files?.[0] || null)} />
          <div className="help">
            Any format allowed. Max 10MB. Saved on server (local upload folder).
          </div>
        </div>

        {/* Preview */}
        <div className="preview">
          <div className="previewTitle">Preview</div>
          <pre className="pre">{previewLines}</pre>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Presets / Validators -------------------- */

function getValidationPresets() {
  const onlyDigits = (v) => v.replace(/\D/g, "");

  const preset = (label, validate, help, placeholder, inputMode = "text") => ({
    label,
    validate,
    help,
    placeholder,
    inputMode,
  });

  return {
    // Name rules (no random numbers)
    PERSON_NAME: preset(
      "Person Name (letters only)",
      (v) => (/^[A-Za-z][A-Za-z\s.'-]{1,70}$/.test(v.trim()) ? "" : "Enter valid name (letters only)"),
      "Example: Ajay Kedar",
      "Full name"
    ),

    ADDRESS_TEXT: preset(
      "Address (min 10 chars)",
      (v) => (v.trim().length >= 10 ? "" : "Address too short (min 10 characters)"),
      "House/Street/City/State/Pincode",
      "Full address"
    ),

    DOB_YYYY_MM_DD: preset(
      "Date (YYYY-MM-DD)",
      (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? "" : "Use format YYYY-MM-DD"),
      "Example: 1999-01-01",
      "YYYY-MM-DD",
      "numeric"
    ),

    MOBILE_10: preset(
      "Mobile (10 digits)",
      (v) => (onlyDigits(v).length === 10 ? "" : "Mobile must be 10 digits"),
      "Digits only",
      "10-digit mobile",
      "numeric"
    ),

    EMAIL: preset(
      "Email",
      (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter valid email"),
      "Example: name@gmail.com",
      "Email"
    ),

    PINCODE_6: preset(
      "Pincode (6 digits)",
      (v) => (onlyDigits(v).length === 6 ? "" : "Pincode must be 6 digits"),
      "Digits only",
      "6-digit pincode",
      "numeric"
    ),

    AADHAAR_12: preset(
      "Aadhaar (12 digits)",
      (v) => (onlyDigits(v).length === 12 ? "" : "Aadhaar must be 12 digits"),
      "Digits only",
      "123456789012",
      "numeric"
    ),

    PAN_10: preset(
      "PAN (ABCDE1234F)",
      (v) => (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.trim().toUpperCase()) ? "" : "PAN must be ABCDE1234F format"),
      "5 letters + 4 digits + 1 letter",
      "ABCDE1234F"
    ),

    PASSPORT: preset(
      "Passport (A1234567)",
      (v) => (/^[A-Z]{1}[0-9]{7}$/.test(v.trim().toUpperCase()) ? "" : "Passport should be 1 letter + 7 digits"),
      "Example: A1234567",
      "A1234567"
    ),

    VOTER_EPIC: preset(
      "Voter ID (ABC1234567)",
      (v) => (/^[A-Z]{3}[0-9]{7}$/.test(v.trim().toUpperCase()) ? "" : "EPIC should be 3 letters + 7 digits"),
      "Example: ABC1234567",
      "ABC1234567"
    ),

    IFSC: preset(
      "IFSC (HDFC0001234)",
      (v) => (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.trim().toUpperCase()) ? "" : "Invalid IFSC format"),
      "4 letters + 0 + 6 alphanumeric",
      "HDFC0001234"
    ),

    BANK_ACC_9_18: preset(
      "Account No (9–18 digits)",
      (v) => {
        const n = onlyDigits(v);
        if (n.length < 9 || n.length > 18) return "Account number must be 9–18 digits";
        return "";
      },
      "Digits only",
      "Account number",
      "numeric"
    ),

    GSTIN_15: preset(
      "GSTIN (15 chars)",
      (v) =>
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.trim().toUpperCase())
          ? ""
          : "Invalid GSTIN",
      "Example: 27ABCDE1234F1Z5",
      "27ABCDE1234F1Z5"
    ),

    UAN_12: preset(
      "UAN (12 digits)",
      (v) => (onlyDigits(v).length === 12 ? "" : "UAN must be 12 digits"),
      "Digits only",
      "12-digit UAN",
      "numeric"
    ),

    DL_ALNUM_13_20: preset(
      "Driving License (13–20 alphanumeric)",
      (v) => (/^[A-Z0-9]{13,20}$/.test(v.trim().toUpperCase().replace(/\s/g, "")) ? "" : "DL must be 13–20 letters/numbers"),
      "No special characters",
      "DL number"
    ),

    RC_ALNUM_8_14: preset(
      "Vehicle RC (8–14 alphanumeric)",
      (v) => (/^[A-Z0-9]{8,14}$/.test(v.trim().toUpperCase().replace(/\s/g, "")) ? "" : "RC should be 8–14 letters/numbers"),
      "Example: MH12AB1234",
      "MH12AB1234"
    ),

    POLICY_ALNUM_6_30: preset(
      "Policy/ID No (6–30 alphanumeric)",
      (v) => (/^[A-Z0-9]{6,30}$/.test(v.trim().toUpperCase().replace(/\s/g, "")) ? "" : "Must be 6–30 letters/numbers"),
      "Used for Insurance, Company IDs, etc.",
      "Policy/ID number"
    ),

    ANY_TEXT_SHORT: preset(
      "Text (min 2 chars)",
      (v) => (v.trim().length >= 2 ? "" : "Too short"),
      "Use simple text",
      "Enter text"
    ),
  };
}

function getDocDefinitions(P) {
  // Helpers to create field
  const F = (name, label, required, presetKey, extra = {}) => {
    const preset = P[presetKey];
    return {
      name,
      label,
      required: !!required,
      validate: preset?.validate,
      help: preset?.help,
      placeholder: preset?.placeholder,
      inputMode: preset?.inputMode,
      ...extra,
    };
  };

  return [
    // GOV IDs
    {
      key: "AADHAAR",
      label: "Aadhaar Card",
      group: "GOV",
      fields: [
        F("name", "Name (as per Aadhaar)", true, "PERSON_NAME"),
        F("aadhaar_number", "Aadhaar Number", true, "AADHAAR_12"),
        F("dob", "Date of Birth", false, "DOB_YYYY_MM_DD"),
        F("address", "Address", false, "ADDRESS_TEXT", { type: "textarea" }),
        F("pincode", "Pincode", false, "PINCODE_6"),
      ],
    },
    {
      key: "PAN",
      label: "PAN Card",
      group: "WORK_TAX",
      fields: [
        F("name", "Name (as per PAN)", true, "PERSON_NAME"),
        F("pan_number", "PAN Number", true, "PAN_10"),
        F("dob", "Date of Birth", false, "DOB_YYYY_MM_DD"),
      ],
    },
    {
      key: "PASSPORT",
      label: "Passport",
      group: "GOV",
      fields: [
        F("name", "Name", true, "PERSON_NAME"),
        F("passport_number", "Passport Number", true, "PASSPORT"),
        F("dob", "Date of Birth", false, "DOB_YYYY_MM_DD"),
        F("place_of_birth", "Place of Birth", false, "ANY_TEXT_SHORT"),
      ],
    },
    {
      key: "VOTER_ID",
      label: "Voter ID (EPIC)",
      group: "GOV",
      fields: [
        F("name", "Name", true, "PERSON_NAME"),
        F("epic_number", "EPIC Number", true, "VOTER_EPIC"),
        F("dob", "Date of Birth", false, "DOB_YYYY_MM_DD"),
        F("address", "Address", false, "ADDRESS_TEXT", { type: "textarea" }),
      ],
    },
    {
      key: "DRIVING_LICENSE",
      label: "Driving License",
      group: "GOV",
      fields: [
        F("name", "Name", true, "PERSON_NAME"),
        F("dl_number", "DL Number", true, "DL_ALNUM_13_20"),
        F("dob", "Date of Birth", false, "DOB_YYYY_MM_DD"),
        F("address", "Address", false, "ADDRESS_TEXT", { type: "textarea" }),
      ],
    },
    {
      key: "VEHICLE_RC",
      label: "Vehicle RC",
      group: "GOV",
      fields: [
        F("owner_name", "Owner Name", true, "PERSON_NAME"),
        F("rc_number", "RC Number", true, "RC_ALNUM_8_14"),
        F("vehicle_number", "Vehicle Number", false, "ANY_TEXT_SHORT"),
      ],
    },

    // WORK & TAX
    {
      key: "GSTIN",
      label: "GSTIN",
      group: "WORK_TAX",
      fields: [
        F("business_name", "Business Name", true, "ANY_TEXT_SHORT"),
        F("gstin", "GSTIN", true, "GSTIN_15"),
        F("business_address", "Business Address", false, "ADDRESS_TEXT", { type: "textarea" }),
      ],
    },
    {
      key: "UAN",
      label: "UAN (EPFO)",
      group: "WORK_TAX",
      fields: [F("name", "Name", true, "PERSON_NAME"), F("uan", "UAN Number", true, "UAN_12")],
    },

    // BANK
    {
      key: "BANK",
      label: "Bank Details",
      group: "BANK",
      fields: [
        F("customer_name", "Customer Name", true, "PERSON_NAME"),
        F("customer_id", "Customer ID (Bank)", true, "POLICY_ALNUM_6_30"),
        F("bank_name", "Bank Name", true, "ANY_TEXT_SHORT"),
        F("account_number", "Account Number", true, "BANK_ACC_9_18"),
        F("ifsc_code", "IFSC Code", true, "IFSC"),
        F("branch", "Branch", false, "ANY_TEXT_SHORT"),
      ],
    },

    // EDU
    {
      key: "BIRTH_CERT",
      label: "Birth Certificate",
      group: "EDU",
      fields: [
        F("name", "Name", true, "PERSON_NAME"),
        F("dob", "Date of Birth", true, "DOB_YYYY_MM_DD"),
        F("registration_number", "Registration No", true, "POLICY_ALNUM_6_30"),
        F("place_of_birth", "Place of Birth", false, "ANY_TEXT_SHORT"),
      ],
    },
    {
      key: "EDU_MARKSHEET",
      label: "Marksheet / Certificate (School/College)",
      group: "EDU",
      fields: [
        F("name", "Student Name", true, "PERSON_NAME"),
        F("roll_number", "Roll/Seat No", true, "POLICY_ALNUM_6_30"),
        F("year", "Year", true, "ANY_TEXT_SHORT"),
        F("board_university", "Board/University", false, "ANY_TEXT_SHORT"),
      ],
    },

    // PRIVATE / UTILITIES
    {
      key: "INSURANCE",
      label: "Insurance Policy (Health/Life/Vehicle)",
      group: "PRIVATE",
      fields: [
        F("policy_holder_name", "Policy Holder Name", true, "PERSON_NAME"),
        F("policy_number", "Policy Number", true, "POLICY_ALNUM_6_30"),
        F("insurer_name", "Company Name", true, "ANY_TEXT_SHORT"),
      ],
    },
    {
      key: "COMPANY_ID",
      label: "Company/Office ID Card",
      group: "PRIVATE",
      fields: [
        F("employee_name", "Employee Name", true, "PERSON_NAME"),
        F("employee_id", "Employee ID", true, "POLICY_ALNUM_6_30"),
        F("company_name", "Company Name", true, "ANY_TEXT_SHORT"),
      ],
    },
    {
      key: "UTILITY_BILL",
      label: "Utility Bill (Electricity/Water/Gas/Internet)",
      group: "PRIVATE",
      fields: [
        F("consumer_name", "Consumer Name", true, "PERSON_NAME"),
        F("connection_or_consumer_no", "Consumer/Connection No", true, "POLICY_ALNUM_6_30"),
        F("provider_name", "Provider/Company", true, "ANY_TEXT_SHORT"),
        F("address", "Address", false, "ADDRESS_TEXT", { type: "textarea" }),
      ],
    },

    // Custom placeholder (not in list, handled separately)
    { key: "CUSTOM", label: "Custom (Add your own document)", group: "CUSTOM", fields: [] },
  ];
}

/* -------------------- Utils -------------------- */

function normalizeKey(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "field";
}

function prettyBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = Number(bytes);
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700;800;900&display=swap');

.atd{
  width:100%;
  font-family: "Noto Serif", "Times New Roman", serif; /* ✅ Roman look */
}

.panel{
  width:100%;
  background: rgba(255,255,255,.90);
  border: 1px solid rgba(255,255,255,.70);
  border-radius: 16px;
  padding: 14px;
  box-sizing: border-box;
}

.head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  margin-bottom: 10px;
}

.title{
  font-size: 18px;
  font-weight: 900;
  background: linear-gradient(90deg, #7c3aed, #ec4899, #f97316);
  -webkit-background-clip:text;
  color:transparent;
}

.sub{
  margin-top:4px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(17,24,39,.70);
  line-height: 1.4;
}

.row{ margin-top: 10px; }

.lbl{
  display:block;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(17,24,39,.82);
}

.req{ color:#dc2626; font-weight:900; margin-left:4px; }

.input{
  width:100%;
  box-sizing:border-box;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,.14);
  padding: 11px 12px;
  margin-top: 6px;
  background: rgba(255,255,255,.92);
  font-weight: 700;
  font-size: 14px;
  outline: none;
}

.input:focus{
  border-color: rgba(124,58,237,.35);
  box-shadow: 0 0 0 5px rgba(124,58,237,.12);
}

.select{
  background: linear-gradient(90deg, rgba(250,245,255,.9), rgba(253,242,248,.9));
}

.help{
  margin-top: 6px;
  font-size: 11px;
  color: rgba(17,24,39,.62);
  font-weight: 700;
  line-height: 1.35;
}

.grid{
  margin-top: 10px;
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field{ min-width:0; }

.btn{
  border:none;
  cursor:pointer;
  border-radius: 14px;
  padding: 11px 14px;
  font-weight: 900;
  color:#fff;
  background: linear-gradient(90deg, #7c3aed, #06b6d4, #22c55e);
  box-shadow: 0 14px 30px rgba(124,58,237,.14);
}

.btn:disabled{ opacity:.75; cursor:not-allowed; }

.btn.ghost{
  background: rgba(17,24,39,.08);
  color:#111827;
  box-shadow:none;
}

.btn.danger{
  background: linear-gradient(90deg, #dc2626, #f97316);
}

/* Custom builder */
.customWrap{ margin-top: 6px; }
.customHeader{
  margin-top: 12px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.customTitle{
  font-weight: 900;
  font-size: 13px;
  color: rgba(17,24,39,.85);
}
.customList{
  margin-top: 10px;
  display:grid;
  gap: 10px;
}
.customCard{
  border-radius: 16px;
  border: 1px solid rgba(17,24,39,.10);
  background: rgba(255,255,255,.85);
  padding: 12px;
}
.customRow{
  display:grid;
  grid-template-columns: 1.3fr 1fr .6fr;
  gap: 10px;
}
.customCol{ min-width:0; }
.customCol.mini{ max-width: 170px; }
.customActions{
  margin-top: 10px;
  display:flex;
  justify-content:flex-end;
}

/* Preview */
.preview{
  margin-top: 14px;
  border-radius: 16px;
  border: 1px solid rgba(17,24,39,.10);
  background: rgba(255,255,255,.70);
  padding: 12px;
}
.previewTitle{
  font-size: 12px;
  font-weight: 900;
  color: rgba(17,24,39,.80);
  margin-bottom: 8px;
}
.pre{
  margin:0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(17,24,39,.88);
  font-weight: 700;
}

/* Center toast modal */
.toastBack{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: 9999;
  padding: 16px;
}
.toast{
  width: min(92vw, 360px);
  background: rgba(255,255,255,.95);
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.7);
  padding: 14px;
  text-align:center;
  box-shadow: 0 30px 90px rgba(0,0,0,.22);
}
.toastTitle{
  font-weight: 1000;
  font-size: 16px;
  color: rgba(17,24,39,.92);
}
.toastMsg{
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(17,24,39,.70);
  line-height: 1.4;
}
.toastBtn{
  margin-top: 12px;
  width: 100%;
  border:none;
  cursor:pointer;
  border-radius: 14px;
  padding: 11px 14px;
  font-weight: 1000;
  color:#fff;
  background: linear-gradient(90deg, #7c3aed, #06b6d4, #22c55e);
}
.toast.success{ outline: 2px solid rgba(34,197,94,.25); }
.toast.error{ outline: 2px solid rgba(220,38,38,.25); }

/* Mobile: full edge-to-edge */
@media (max-width: 740px){
  .panel{
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    padding: 12px;
  }
  .grid{ grid-template-columns: 1fr; }
  .customRow{ grid-template-columns: 1fr; }
  .customCol.mini{ max-width: none; }
  .btn{ width: 100%; }
  .customHeader .btn{ width: auto; }
}
`;
