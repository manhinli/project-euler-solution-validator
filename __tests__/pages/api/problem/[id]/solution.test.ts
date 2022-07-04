import { join } from "path";
import {
    COLLECTIONS,
    getClient,
    getCollection,
} from "../../../../../lib/database";
import { getEnv } from "../../../../../lib/env";
import ApiProblemIdSolution from "../../../../../pages/api/problem/[id]/solution";
import { Attempt } from "../../../../../types/Attempt";
import { ProblemMetadata } from "../../../../../types/Problem";

const PROBLEMS_COMPILED_PATH = getEnv("PROBLEMS_COMPILED_PATH");

describe("ApiProblemIdSolution", () => {
    beforeEach(async () => {
        // Wipe collections
        for (const collection of COLLECTIONS) {
            await (await getCollection(collection)).deleteMany({});
        }

        // Mock virtual dynamic module import for solution validation
        jest.mock(
            join(PROBLEMS_COMPILED_PATH, "42.js"),
            () => ({
                validateSolution: (value) => value === "123",
            }),
            { virtual: true }
        );
    });

    afterEach(() => {
        jest.resetModules();
    });

    afterAll(async () => {
        // Close connection after tests
        await (await getClient()).close();
    });

    it("rejects GET requests", async () => {
        const req = {
            method: "GET",
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdSolution(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(405);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({
            error: "Method not allowed",
        });
    });

    it("processes correct solution attempt and writes to database", async () => {
        // Fill DB
        const problems = [
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
            method: "POST",
            query: {
                id: "42",
            },
            body: {
                userName: "Test user",
                attemptValue: "123",
            },
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdSolution(req, res);

        // Retrieve attempt
        const attempts = await (
            await getCollection<Attempt>("attempts")
        ).countDocuments({
            userName: "Test user",
            attemptValue: "123",
        });

        expect(attempts).toBe(1);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(200);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toMatchObject({
            problemId: 42,
            userName: "Test user",
            attemptValue: "123",
            attemptSuccessful: true,
        });
        expect(res.json.mock.calls[0][0]).toHaveProperty("dateTime");
    });

    it("processes incorrect solution attempt and writes to database", async () => {
        // Fill DB
        const problems = [
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
            method: "POST",
            query: {
                id: "42",
            },
            body: {
                userName: "Test user",
                attemptValue: "321",
            },
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdSolution(req, res);

        // Retrieve attempt
        const attempts = await (
            await getCollection<Attempt>("attempts")
        ).countDocuments({
            userName: "Test user",
            attemptValue: "321",
        });

        expect(attempts).toBe(1);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(200);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toMatchObject({
            problemId: 42,
            userName: "Test user",
            attemptValue: "321",
            attemptSuccessful: false,
        });
        expect(res.json.mock.calls[0][0]).toHaveProperty("dateTime");
    });

    it("returns 404 Not Found if problem ID not in database", async () => {
        const req = {
            method: "POST",
            query: {
                id: "68",
            },
            body: {
                userName: "Test user",
                attemptValue: "123",
            },
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdSolution(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(404);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({ error: "Not found" });
    });

    it("returns 400 Bad Request if problem ID is not valid integer", async () => {
        const req = {
            method: "POST",
            query: {
                id: "not a number",
            },
            body: {
                userName: "Test user",
                attemptValue: "123",
            },
        };

        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };

        await ApiProblemIdSolution(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(400);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({ error: "Bad request" });
    });
});
