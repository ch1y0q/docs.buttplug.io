// @ts-check

/**
 * Remark plugin that injects device configuration data from device-config-v4 YAML
 * into STPIHKAL protocol documentation pages at build time.
 *
 * Reads `config_ref` and `config_identifier` from frontmatter:
 * - config_ref: filename in data/device-config/ (e.g., "svakom.yml")
 * - config_identifier: null (show all configs) or specific identifier string
 *
 * Injects a "Device Configuration" section with:
 * - BLE names and advertised services
 * - Service/characteristic map
 * - Device features (vibrate/rotate/oscillate with value ranges)
 * - Per-device configuration table
 * - Raw YAML code block for machine parsing
 */

const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

/**
 * @typedef {{
 *   index?: number,
 *   description?: string,
 *   output?: Record<string, { value?: number[] }>,
 *   input?: Record<string, { value?: number[][] }>,
 * }} Feature
 *
 * @typedef {{ identifier?: string | string[], name?: string, features?: Feature[] }} Configuration
 *
 * @typedef {{
 *   communication?: Array<{
 *     btle?: {
 *       names?: string[],
 *       advertised_services?: string[],
 *       services?: Record<string, Record<string, string>>,
 *     },
 *   }>,
 *   defaults?: { features?: Feature[] },
 *   configurations?: Configuration[],
 * }} DeviceConfig
 *
 * @typedef {{ config_ref?: string, config_identifier?: string | null }} DeviceConfigFrontmatter
 */

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
const plugin = () => {
  const dataDir = path.resolve(__dirname, "..", "data", "device-config");

  return (ast, vfile) => {
    const frontmatter = /** @type {DeviceConfigFrontmatter | undefined} */ (
      vfile.data.frontmatter
    );
    if (!frontmatter || !frontmatter.config_ref) {
      return;
    }

    const configPath = path.join(dataDir, frontmatter.config_ref);
    if (!fs.existsSync(configPath)) {
      console.warn(
        `[remark-device-config] Config file not found: ${configPath} (referenced by ${vfile.path})`
      );
      return;
    }

    let config;
    try {
      config = /** @type {DeviceConfig} */ (
        yaml.load(fs.readFileSync(configPath, "utf8"))
      );
    } catch (err) {
      console.warn(
        `[remark-device-config] Failed to parse ${configPath}: ${/** @type {Error} */ (err).message}`
      );
      return;
    }

    const identifier = frontmatter.config_identifier || null;
    const nodes = buildDeviceConfigNodes(config, identifier);

    // Find the "Device Configuration" HTML comment placeholder or append after BLE Profile
    const insertIndex = findInsertionPoint(ast);
    ast.children.splice(insertIndex, 0, ...nodes);
  };
};

/**
 * Find where to insert the device config section.
 * Looks for an HTML comment <!-- Auto-populated from device-config-v4 at build time -->
 * or a heading containing "Device Configuration".
 * Falls back to end of document.
 *
 * @param {import('mdast').Root} ast
 * @returns {number}
 */
function findInsertionPoint(ast) {
  for (let i = 0; i < ast.children.length; i++) {
    const node = ast.children[i];
    // Look for the placeholder comment
    if (node.type === "html" && node.value.includes("Auto-populated from device-config-v4")) {
      // Remove the comment and insert at its position
      ast.children.splice(i, 1);
      return i;
    }
    // Look for an empty "Device Configuration" heading
    if (
      node.type === "heading" &&
      node.children &&
      node.children.some(
        (c) => c.type === "text" && c.value === "Device Configuration"
      )
    ) {
      // Insert after this heading
      return i + 1;
    }
  }
  // Fallback: append at end
  return ast.children.length;
}

/**
 * Build mdast nodes for the device configuration section.
 *
 * @param {DeviceConfig} config
 * @param {string | null} identifier
 * @returns {import('mdast').RootContent[]}
 */
function buildDeviceConfigNodes(config, identifier) {
  /** @type {import('mdast').RootContent[]} */
  const nodes = [];
  const comm = config.communication && config.communication[0];
  const btle = comm && comm.btle;

  if (!btle) {
    nodes.push(paragraph("No BLE configuration data available."));
    return nodes;
  }

  // BLE Names
  if (btle.names && btle.names.length > 0) {
    nodes.push(heading(3, "BLE Names"));
    /** @type {import('mdast').PhrasingContent[]} */
    const children = [];
    btle.names.forEach((n, i) => {
      if (i > 0) children.push({ type: "text", value: ", " });
      children.push({ type: "inlineCode", value: String(n) });
    });
    nodes.push({ type: "paragraph", children });
  }

  // Advertised Services
  if (btle.advertised_services && btle.advertised_services.length > 0) {
    nodes.push(heading(3, "Advertised Services"));
    nodes.push(list(btle.advertised_services.map((s) => inlineCode(s))));
  }

  // Service/Characteristic Map
  if (btle.services) {
    nodes.push(heading(3, "Service & Characteristic Map"));
    const serviceEntries = Object.entries(btle.services);
    for (const [serviceUuid, chars] of serviceEntries) {
      nodes.push({
        type: "heading",
        depth: 4,
        children: [
          { type: "text", value: "Service " },
          { type: "inlineCode", value: serviceUuid },
        ],
      });
      const rows = Object.entries(chars).map(([role, charUuid]) => [
        role,
        charUuid,
      ]);
      nodes.push(
        table(["Role", "Characteristic UUID"], rows)
      );
    }
  }

  // Device Features (from defaults or filtered config)
  const features = getFeatures(config, identifier);
  if (features && features.length > 0) {
    nodes.push(heading(3, "Device Features"));
    const featureRows = [];
    for (const feat of features) {
      if (feat.output) {
        for (const [type, spec] of Object.entries(feat.output)) {
          const range = spec.value ? `${spec.value[0]}–${spec.value[1]}` : "N/A";
          featureRows.push([
            feat.description || `Feature ${feat.index}`,
            type,
            range,
          ]);
        }
      }
      if (feat.input) {
        for (const [type, spec] of Object.entries(feat.input)) {
          const range =
            spec.value && spec.value[0]
              ? `${spec.value[0][0]}–${spec.value[0][1]}`
              : "N/A";
          featureRows.push([
            feat.description || `Feature ${feat.index}`,
            `${type} (input)`,
            range,
          ]);
        }
      }
    }
    nodes.push(table(["Feature", "Type", "Value Range"], featureRows));
  }

  // Per-device configurations table
  if (config.configurations && config.configurations.length > 0) {
    const configs = identifier
      ? config.configurations.filter((c) => {
          const ids = Array.isArray(c.identifier)
            ? c.identifier
            : [c.identifier];
          return ids.includes(identifier);
        })
      : config.configurations;

    if (configs.length > 0) {
      nodes.push(heading(3, "Device Configurations"));
      const configRows = configs.map((c) => {
        const ids = Array.isArray(c.identifier)
          ? c.identifier.join(", ")
          : c.identifier || "";
        const featureTypes = (c.features || config.defaults?.features || [])
          .flatMap((f) => (f.output ? Object.keys(f.output) : []))
          .join(", ");
        return [c.name || "", ids, featureTypes || "default"];
      });
      nodes.push(
        table(["Device", "Identifier", "Features"], configRows)
      );
    }
  }

  // Raw YAML code block for machine parsing
  nodes.push(heading(3, "Raw Configuration"));
  nodes.push(
    paragraph("Machine-readable device configuration data:")
  );
  const yamlContent = identifier
    ? yaml.dump(filterConfigByIdentifier(config, identifier))
    : yaml.dump(config);
  nodes.push(codeBlock("yaml", yamlContent));

  return nodes;
}

/**
 * Get features for a specific identifier or defaults.
 *
 * @param {DeviceConfig} config
 * @param {string | null} identifier
 * @returns {Feature[]}
 */
function getFeatures(config, identifier) {
  if (identifier && config.configurations) {
    const match = config.configurations.find((c) => {
      const ids = Array.isArray(c.identifier)
        ? c.identifier
        : [c.identifier];
      return ids.includes(identifier);
    });
    if (match && match.features) {
      return match.features;
    }
  }
  return config.defaults && config.defaults.features
    ? config.defaults.features
    : [];
}

/**
 * Filter config to a specific identifier for YAML dump.
 *
 * @param {DeviceConfig} config
 * @param {string} identifier
 * @returns {DeviceConfig}
 */
function filterConfigByIdentifier(config, identifier) {
  const filtered = { ...config };
  if (config.configurations) {
    filtered.configurations = config.configurations.filter((c) => {
      const ids = Array.isArray(c.identifier)
        ? c.identifier
        : [c.identifier];
      return ids.includes(identifier);
    });
  }
  return filtered;
}

// --- mdast node constructors ---

/**
 * @param {import('mdast').Heading['depth']} depth
 * @param {string} text
 * @returns {import('mdast').Heading}
 */
function heading(depth, text) {
  return { type: "heading", depth, children: [{ type: "text", value: text }] };
}

/**
 * @param {string} text
 * @returns {import('mdast').Paragraph}
 */
function paragraph(text) {
  return { type: "paragraph", children: [{ type: "text", value: text }] };
}

/**
 * @param {unknown} value
 * @returns {import('mdast').InlineCode}
 */
function inlineCode(value) {
  return { type: "inlineCode", value: String(value) };
}

/**
 * @param {import('mdast').PhrasingContent[]} items
 * @returns {import('mdast').List}
 */
function list(items) {
  return {
    type: "list",
    ordered: false,
    children: items.map((item) => ({
      type: "listItem",
      children: [{ type: "paragraph", children: [item] }],
    })),
  };
}

/**
 * @param {string[]} headers
 * @param {unknown[][]} rows
 * @returns {import('mdast').Table}
 */
function table(headers, rows) {
  /** @type {import('mdast').TableRow} */
  const headerRow = {
    type: "tableRow",
    children: headers.map((h) => ({
      type: "tableCell",
      children: [{ type: "text", value: h }],
    })),
  };
  /** @type {import('mdast').TableRow[]} */
  const dataRows = rows.map((row) => ({
    type: "tableRow",
    children: row.map((cell) => ({
      type: "tableCell",
      children: [{ type: "text", value: String(cell) }],
    })),
  }));
  return {
    type: "table",
    align: headers.map(() => null),
    children: [headerRow, ...dataRows],
  };
}

/**
 * @param {string} lang
 * @param {string} value
 * @returns {import('mdast').Code}
 */
function codeBlock(lang, value) {
  return { type: "code", lang, value: value.trimEnd() };
}

module.exports = plugin;
