import {
    COLLECTIONS,
    getClient,
    getCollection,
} from "../../../../../lib/database";
import ApiProblemIdIndex from "../../../../../pages/api/problem/[id]";
import { ProblemMetadata } from "../../../../../types/Problem";

describe("ApiProblemIdIndex", () => {
    beforeEach(async () => {
        // Wipe collections
        for (const collection of COLLECTIONS) {
            await (await getCollection(collection)).deleteMany({});
        }
    });

    afterAll(async () => {
        // Close connection after tests
        await (await getClient()).close();
    });

    it("rejects POST requests", async () => {
        const req = {
            method: "POST",
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdIndex(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(405);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({
            error: "Method not allowed",
        });
    });

    it("returns requested problem", async () => {
        // Fill DB
        const problems = [
            {
                problemId: 85,
                title: "Number of Known Primes that existed before 1984",
                description: "<p>Description for 85</p>",
                url: "http://example.com/problem/85",
                license: "License for 85",
            },
            {
                problemId: 42,
                title: "Ultimate Question of Life, the Universe, and Everything",
                description: "<p>Description for 42</p>",
                url: "http://example.com/problem/42",
                license: "License for 42",
            },
        ];
        await (
            await getCollection<ProblemMetadata>("problems")
        ).insertMany(problems);

        // Make request
        const req = {
            method: "GET",
            query: {
                id: "42",
            },
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdIndex(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(200);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({
            problemId: 42,
            title: "Ultimate Question of Life, the Universe, and Everything",
            description: "<p>Description for 42</p>",
            url: "http://example.com/problem/42",
            license: "License for 42",
        });
    });

    it("returns 404 Not Found if problem ID not in database", async () => {
        const req = {
            method: "GET",
            query: {
                id: "68",
            },
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdIndex(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(404);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({ error: "Not found" });
    });

    it("returns 400 Bad Request if problem ID is not valid integer", async () => {
        const req = {
            method: "GET",
            query: {
                id: "not a number",
            },
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdIndex(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(400);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({ error: "Bad request" });
    });
});
