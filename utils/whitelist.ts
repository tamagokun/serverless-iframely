// @ts-ignore
import CONFIG from "iframely/config.loader.js";
import { createRequire } from "module";
import * as crypto from "crypto";
const require = createRequire(import.meta.url);

const whitelistObject = require("../whitelist/iframely-default.json");

if (whitelistObject.domains && CONFIG.WHITELIST_WILDCARD) {
  whitelistObject.domains["*"] = CONFIG.WHITELIST_WILDCARD;
}

type WhitelistOptions = {
  disableWildcard?: boolean;
  exclusiveRel?: string;
};

export function findWhitelistRecordFor(
  uri: string,
  options: WhitelistOptions = {}
) {
  const { disableWildcard = false, exclusiveRel } = options;
  const patterns = extractDomainPatterns(uri, disableWildcard);

  let record,
    i = 0;
  while (!record && i < patterns.length) {
    record = whitelistObject.domains[patterns[i]];
    if (record) {
      record = {
        ...record,
        domain: patterns[i],
        isAllowed: function (path: string, option: string) {
          // String path: "og.video"
          return isAllowed.apply(this, [path, option]);
        },
        getQATags: function (rel: any) {
          var links = getWhitelistLinks(rel);
          var that = this;
          var tags = links.map(function (link) {
            return getTags.apply(that, [link.source, link.type]);
          });
          tags = tags.flat().filter(unique);
          // Remove allow if denied.
          var allowIdx = tags.indexOf("allow");
          var denyIdx = tags.indexOf("deny");
          if (allowIdx > -1 && denyIdx > -1) {
            tags.splice(allowIdx, 1);
          }
          return tags;
        },
        getRecordHash: getRecordHash,
        isDefault: patterns[i] === "*",
      };

      if (exclusiveRel) {
        record.exclusiveRel = exclusiveRel;
        for (var rel in CONFIG.REL) {
          if (rel !== exclusiveRel) {
            delete record[rel];
          }
        }
      }
    }
    i++;
  }

  return record;
}

function unique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

function hash(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function isAllowed(path: string, option: string) {
  var bits = path.split(".");
  // @ts-ignore
  var tags = getTags.apply(this, bits);

  // Plugins expect `undefined` if whitelist record does not contain a path explicitely.
  var isAllowed = tags && tags.includes("allow");
  if (!isAllowed) {
    // undefined
    isAllowed = !tags || !tags.includes("deny") ? undefined : false;
  } else {
    // return true or false;
    isAllowed = !option || tags.includes(option);
  }

  return isAllowed;
}

function getTags(source: any, type: any) {
  // @ts-ignore
  var s = this[source];
  var result = [];
  if (s) {
    result = s[type];
  }

  if (typeof result == "string") {
    result = [result];
  }

  return result;
}

function getWhitelistLinks(rels: string[]) {
  let result: { source: string; type: string }[] = [];

  const sources = rels.filter((v) => CONFIG.KNOWN_SOURCES.includes(v));

  if (sources.length == 0 && rels.indexOf("player") > -1) {
    // Skip single player rel.
  } else {
    sources.forEach(function (source) {
      CONFIG.REL[source].forEach(function (type: string) {
        var iframelyType = CONFIG.REL_MAP[type] || type;

        if (rels.indexOf(iframelyType) > -1) {
          result.push({
            source: source,
            type: type,
          });
        }
      });
    });
  }

  return result;
}

function getRecordHash() {
  // @ts-ignore
  if (this.isDefault) {
    return "";
  }

  var data = {};
  // @ts-ignore
  var that = this;
  CONFIG.KNOWN_SOURCES.forEach(function (source: string) {
    if (source in that) {
      // @ts-ignore
      data[source] = that[source];
    }
  });

  return hash(JSON.stringify(data));
}

function extractDomain(uri: string) {
  var m = uri.toLowerCase().match(/^(?:https?:\/\/)?([^/:?]+)/i); // beware of :port
  if (m) {
    return m[1];
  } else {
    return null;
  }
}

function extractDomainPatterns(uri: string, disableWildcard: boolean) {
  var patterns: string[] = [];

  var domain = extractDomain(uri);
  if (!domain) {
    return patterns;
  }

  // Only full domain exact match.
  patterns.push(domain);

  // 'www' workaround.
  var bits = domain.split(".");
  if (bits[0] != "www") {
    patterns.push("www." + domain);
  } else {
    // Remove www.
    bits.splice(0, 1);
    domain = bits.join(".");
    patterns.push(domain);
  }

  // Wildcard pattern matches parent and this domain.
  if (bits.length > 2) {
    for (var i = 0; i < bits.length - 1; i++) {
      var d = bits.slice(i).join(".");
      patterns.push("*." + d);
    }
  } else {
    patterns.push("*." + domain);
  }

  if (!disableWildcard) {
    // System-wide top-level wildcard, taken from config.
    patterns.push("*");
  }

  return patterns;
}
