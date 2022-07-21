import { TokenRequest, types } from "@livelyvideo/video-client-web";

export interface EncoderDemoOptions {
  livelyEndpoint: string;
  authUrl: string;
  streamKey: string;
  scope: string;
  displayName?: string;
  userId?: string;
  clientReferrer?: string;
  streamName?: string;
}

export const tokenRefresher = (options: EncoderDemoOptions): types.TokenGetter => {
  const mirrors = [
    {
      id: options.streamKey,
      streamName: options.streamName != null ? options.streamName : "demo",
      kind: "rtmp",
      rtmpPath: `/origin_proxy/${options.streamKey}`,
      clientEncoder: "demo",
      streamKey: options.streamKey,
      clientReferrer: options.clientReferrer !== undefined ? options.clientReferrer : null,
    },
  ];

  return async (): Promise<string> => {
    const url = `${options.authUrl}`;
    let token: string;
    try {
      const fetchOptions = {
        scopes: [options.scope],
        userId: options.userId ?? options.streamKey,
        data: {
          displayName: options.displayName ?? options.streamKey,
          mirrors,
        },
      };
      token = await fetchToken(url, fetchOptions);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("unable to get access token", {
        error,
        url,
      });
      throw error;
    }

    return token;
  };
};

export const fetchToken = async (authUrl: string, reqBody: TokenRequest): Promise<string> => {
  const response = await window.fetch(authUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  });
  if (response.status !== 200) {
    throw new Error("Unable to get token");
  }

  const body = await response.json();
  return body.token;
};