import type { VercelRequest, VercelResponse } from "@vercel/node";
import { murmurHash, prepareUri } from "../utils/url.js";
import { run } from "../utils/iframely.js";
// @ts-ignore
import * as whitelist from "iframely/lib/whitelist.js";
// @ts-ignore
import * as iframelyUtils from "iframely/lib/utils.js";
// @ts-ignore
import * as iframelyCore from "iframely";

type IFramelyResponse = {
  id?: string;
  meta: Record<string, string>;
  html?: string;
  links: any[];
  rel?: string[];
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Origin", "*");

  const uri = prepareUri(String(request.query.uri || request.query.url || ""));

  if (!uri) {
    return response
      .status(400)
      .json({ success: false, error: "url param is required" });
  }

  try {
    let result = (await run(uri, {
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
    })) as IFramelyResponse;

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

    if (!result.id) {
      result.id = murmurHash(uri);
    }

    return response.json(result);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ success: false, error: err });
  }
}
