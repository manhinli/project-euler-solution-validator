const { MongoClient } = require("mongodb");
const readdirGlob = require("readdir-glob");

// Index pre-compiled problems into the database
//
// NOTE: This will wipe the database and recreate collections!

const DATABASE_URI = process.env.DATABASE_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;
const COLLECTIONS = ["attempts", "problems"];
const PROBLEMS_COMPILED_PATH = process.env.PROBLEMS_COMPILED_PATH;

(async function () {
    // Connect to database
    const client = new MongoClient(DATABASE_URI);
    await client.connect();

    // Recreate database
    await client.db(DATABASE_NAME).dropDatabase();

    const db = client.db(DATABASE_NAME);
    for (const collection of COLLECTIONS) {
        await db.createCollection(collection);
    }

    // Index compiled problems located in /dist/problems
    const problemsGlob = readdirGlob(PROBLEMS_COMPILED_PATH, {
        pattern: "*.js",
    });

    // Keep track of how many we've indexed
    let indexCount = 0;

    problemsGlob.on("match", async (item) => {
        const path = item.absolute;
        try {
            // Pull in metadata from each problem
            const problemMetadata = require(path).metadata;
            await db.collection("problems").insertOne(problemMetadata);

            ++indexCount;
        } catch (e) {
            console.error(`Unable to import metadata from ${path}`, e);
        }
    });

    problemsGlob.on("error", (e) => {
        console.error(e);
        process.exit(1);
    });

    problemsGlob.on("end", async () => {
        // Check that we've got at least one problem
        const problemsCount = await db.collection("problems").countDocuments();

        if (problemsCount !== indexCount) {
            console.error(
                `${problemsCount} documents in "problems" collection; expected ${indexCount} - did something go wrong with indexing?`
            );
            process.exit(1);
            return;
        }

        console.log("Indexing complete");
        process.exit(0);
    });
})();
