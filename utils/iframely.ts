// @ts-ignore
import * as iframely from "iframely";

export async function run(uri: string, options: {}) {
  return new Promise((resolve, reject) => {
    iframely.run(uri, options, (error: any, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
