import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prepareUri } from "../utils/url.js";
import { run } from "../utils/iframely.js";
// @ts-ignore
import * as whitelist from "iframely/lib/whitelist.js";
// @ts-ignore
import * as iframelyUtils from "iframely/lib/utils.js";
// @ts-ignore
import * as iframelyCore from "iframely";
// import node-cache so it is included in build
// @ts-ignore
import "iframely/lib/cache-engines/node-cache.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const uri = prepareUri(String(request.query.uri || request.query.url || ""));

  if (!uri) {
    return response
      .status(400)
      .json({ success: false, error: "url param is required" });
  }

  try {
    let result = await run(uri, {
      v: "1.3",
      //   debug: true,
      //   returnProviderOptionsUsage: true,
      mixAllWithDomainPlugin: false,
      forceParams: null,
      whitelist: false,
      readability: false,
      getWhitelistRecord: whitelist.findWhitelistRecordFor,
      maxWidth: undefined,
      promoUri: undefined,
      refresh: true,
      providerOptions: {},
    });

    // @ts-expect-error
    iframelyCore.sortLinks(result.links);

    iframelyUtils.filterLinks(result, {
      filterNonSSL: false,
      filterNonHTML5: false,
      maxWidth: undefined,
    });

    iframelyUtils.generateLinksHtml(result, {
      mediaPriority: false,
      autoplayMode: false,
      aspectWrapperClass: false,
      maxWidthWrapperClass: false,
      omitInlineStyles: false,
      forceWidthLimitContainer: false,
    });

    return response.json(result);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ success: false, error: err });
  }
}
