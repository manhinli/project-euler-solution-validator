import {
    COLLECTIONS,
    getClient,
    getCollection,
} from "../../../../../lib/database";
import ApiProblemIdLeaderboard from "../../../../../pages/api/problem/[id]/leaderboard";
import { Attempt } from "../../../../../types/Attempt";
import { ProblemMetadata } from "../../../../../types/Problem";

describe("ApiProblemIdLeaderboard", () => {
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

        await ApiProblemIdLeaderboard(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(405);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({
            error: "Method not allowed",
        });
    });

    it("returns requested problem's leaderboard in expected order", async () => {
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
        const attempts = [
            {
                problemId: 85,
                userName: "Sam",
                dateTime: new Date(1656920301000),
                attemptValue: "64",
                attemptSuccessful: false,
            },
            {
                problemId: 85,
                userName: "Sam",
                dateTime: new Date(1656920302000),
                attemptValue: "123",
                attemptSuccessful: true,
            },
            {
                problemId: 42,
                userName: "Jon",
                dateTime: new Date(1656920308000),
                attemptValue: "1",
                attemptSuccessful: false,
            },
            {
                problemId: 42,
                userName: "Alex",
                dateTime: new Date(1656920308000),
                attemptValue: "1",
                attemptSuccessful: false,
            },
            {
                problemId: 42,
                userName: "Sam",
                dateTime: new Date(1656920308000),
                attemptValue: "1",
                attemptSuccessful: false,
            },
            {
                problemId: 42,
                userName: "Alex",
                dateTime: new Date(1656920309000),
                attemptValue: "0",
                attemptSuccessful: true,
            },
            {
                problemId: 42,
                userName: "Sam",
                dateTime: new Date(1656920309000),
                attemptValue: "1",
                attemptSuccessful: false,
            },
            {
                problemId: 42,
                userName: "Jon",
                dateTime: new Date(1656920309000),
                attemptValue: "1",
                attemptSuccessful: false,
            },
            {
                problemId: 42,
                userName: "Jon",
                dateTime: new Date(1656920310000),
                attemptValue: "1",
                attemptSuccessful: false,
            },
            {
                problemId: 42,
                userName: "Jon",
                dateTime: new Date(1656920311000),
                attemptValue: "0",
                attemptSuccessful: true,
            },
            {
                problemId: 42,
                userName: "Sam",
                dateTime: new Date(1656920311000),
                attemptValue: "0",
                attemptSuccessful: true,
            },
            {
                problemId: 85,
                userName: "Alex",
                dateTime: new Date(1656920313000),
                attemptValue: "123",
                attemptSuccessful: true,
            },
        ];

        await (
            await getCollection<ProblemMetadata>("problems")
        ).insertMany(problems);
        await (await getCollection<Attempt>("attempts")).insertMany(attempts);

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

        await ApiProblemIdLeaderboard(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(200);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual([
            {
                earliestSuccessfulAttempt: new Date("2022-07-04T07:38:29.000Z"),
                numberOfAttempts: 2,
                userName: "Alex",
            },
            {
                earliestSuccessfulAttempt: new Date("2022-07-04T07:38:31.000Z"),
                numberOfAttempts: 3,
                userName: "Sam",
            },
            {
                earliestSuccessfulAttempt: new Date("2022-07-04T07:38:31.000Z"),
                numberOfAttempts: 4,
                userName: "Jon",
            },
        ]);
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

        await ApiProblemIdLeaderboard(req, res);

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

        await ApiProblemIdLeaderboard(req, res);

        expect(res.status).toBeCalled();
        expect(res.status.mock.calls[0][0]).toBe(400);

        expect(res.json).toBeCalled();
        expect(res.json.mock.calls[0][0]).toEqual({ error: "Bad request" });
    });
});
