import { NextApiResponse } from "next";

type Json = Record<string, unknown> | Json[];

/**
 * Sends HTTP 200 OK back to client with given data.
 *
 * @param res Next.js response object
 * @param data Data to send to client
 */
export function respondSuccessWithJson(res: NextApiResponse, data: Json) {
    return res.status(200).json(data);
}

/**
 * Sends a client error response (defaulting to HTTP 400) with given error.
 *
 * @param res Next.js response object
 * @param code Response code
 * @param error Error object
 */
export function respondClientError(
    res: NextApiResponse,
    code: number = 400,
    error?: unknown
) {
    let message = "Bad request";

    // Determine if `error` has a message that we can provide
    if (error && typeof error === "object" && Object.hasOwn(error, "message")) {
        message = `${(error as any).message}`;
    } else if (typeof error === "string") {
        message = error;
    }

    return res.status(code).json({
        error: message,
    });
}

/**
 * Sends HTTP 404 Not Found back to client.
 *
 * @param res Next.js response object
 */
export function respondNotFound(res: NextApiResponse) {
    return respondClientError(res, 404, "Not found");
}

/**
 * Sends HTTP 405 Method Not Allowed back to client.
 *
 * @param res Next.js response object
 */
export function respondMethodNotAllowed(res: NextApiResponse) {
    return respondClientError(res, 405, "Method not allowed");
}
