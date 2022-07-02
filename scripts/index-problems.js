const { MongoClient } = require("mongodb");
const readdirGlob = require("readdir-glob");

// Index pre-compiled problems into the database
//
// NOTE: This will wipe the database and recreate collections!

(async function () {
    // Connect to database
    const client = new MongoClient("mongodb://database:27017");
    await client.connect();

    // Recreate database
    await client.db("airetc").dropDatabase();

    const db = client.db("airetc");
    db.createCollection("problems");
    db.createCollection("attempts");

    // Index compiled problems located in /dist/problems
    const problemsGlob = readdirGlob("./dist/problems", { pattern: "*.js" });

    problemsGlob.on("match", async (item) => {
        const path = item.absolute;
        try {
            // Pull in metadata from each problem
            const problemMetadata = require(path).metadata;
            await db.collection("problems").insertOne(problemMetadata);
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

        if (problemsCount === 0) {
            console.error(
                "No problems were indexed into DB - possibly no compiled problems found?"
            );
            process.exit(1);
            return;
        }

        console.log("Indexing complete");
        process.exit(0);
    });
})();
