# project-euler-solution-validator

## Running the application

You will require Docker with Docker Compose to get this project up and running.

### Step 1 - Starting up

To begin:
```
docker-compose up -d
```

This will spin up a basic Next.js/Node.js + MongoDB stack with the application.

### Step 2 - Indexing problem definitions

As the database will be empty at this stage; to index the problems provided with
this project, you will need to run the following while the project is running:

```
docker-compose exec proj_euler node ./scripts/index-problems.js
```

This step is only required once to initialise the database.

### Step 3 - Using the service

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tests

Tests for both backend and frontend can be found in `/__tests__`.

### Running tests

Tests can be run using the development Docker Compose:

```
# Make sure to tear down existing instances if not done so already
docker-compose down

# Run tests in dev environment
# Due to database calls in tests, we are running tests linearly
docker-compose -f ./docker-compose.dev.yaml run --rm proj_euler npm test -- --runInBand
```

## Discussion of structure, design and thought processes

### Frontend

The frontend is a basic React-based UI delivered via the Next.js server. Code
for the pages which contain the frontend can be found under `/pages`.

#### Design

For this example project, the design has been intended to be light and minimal,
in line with the design of the original Project Euler website, with orange and
grey being the prominent colours. To respect copyright and licensing conditions,
attribution is displayed as encoded in the metadata of the relevant problem
files under `/problems`.

Responsiveness to the viewport's width is achieved by adjusting the layout of
the problem pages from a grid to flexbox when the width is narrow (at 768px).

#### Technical

Most XHR requests are done via the `swr` package which handles the (re)loading
of `GET` requests without the need for much boilerplate, with the only `POST`
request in the application done through `fetch()` directly.

As no authentication of users is required, the field for a user's name is left
for the user to self-identify themselves. The user's name is kept in an
application context that keeps hold of the value for as long as the context is
available to reduce the need to re-enter the user's name when attempting
different problems on the website.

The leaderboard itself is formatted to the user's local timezone and regional
date/time format (as supported by the browser) for localisation, with raw
date/time information available as a tooltip on the time values for reference if
required.

### Backend

The backend is based on Next.js' API route functionality, of which the code can
be found under `/pages/api`.

Configuration of the backend's database connection can be found in the `/.env`
environment file, where username and password can be configured in the URI. Note
that none is needed for the provided example Docker Compose configuration.

#### Database

The database consists of two collections:

* `problems`
    * Stores documents which reflect the metadata of problems (`/problems`)
        indexed
* `attempts`
    * Stores all attempts, including the problem ID, user's name, time of the
        attempt, the solution value submitted and whether or not the attempt was
        considered successful (correct solutions)

While the backend currently does not utilise ORM-like modelling/interfaces for
interacting with the MongoDB database, it is a consideration that can be
revisited as the project grows in complexity. It was, however, considered
sufficient to use the standard MongoDB driver for direct database access through
methods such as `find()`, `aggregate()` and `insertOne()`, with TypeScript
interfaces to maintain data consistency within the scope of the small project.

#### Endpoints

The API is provided as REST HTTP endpoints, with only `GET` and `POST` methods
in use across 4 different endpoints:
* `GET  /api/problem` - get all problems
* `GET  /api/problem/:id` - get one problem 
* `GET  /api/problem/:id/leaderboard` - get leaderboard of one problem
* `POST /api/problem/:id/solution` - post solution attempt to one problem

The design of the leaderboard endpoint to be separate was done to faciliate the
separate updating of the leaderboard by frontend clients, rather than utilising
a larger response to wrap all of this information in the same `GET` request for
one problem.

#### Leaderboard

The leaderboard information is generated entirely by a complex aggregation
(`/pages/api/problem/[id]/leaderboard.ts`) which while long, is done in the aim
of keeping data processing within the realm of the database rather than in the
application server as much as practically possible.

#### Problem solvers

Problem solvers are structured as individual TypeScript files under `/problems`.
The module files are compiled (`/scripts/compile-problems.sh`) and loaded into
the database (`/scripts/index-problems.js`) through a separate process. These
solvers are loaded in the solution validation API endpoint via dynamic imports,
with the metadata captured into the database helping to describe them.

With the problem solvers split from the application code, one can load future
problems into the system without the need to recompile the application itself.

Problem solvers are structured to receive input as strings and not as numbers as
there do exist Project Euler problems where solutions are not plain numbers. In
addition there can be issues with the interpretation of floating point numbers
which may cause comparison/validation issues if exact representations are not
used, as numbers (excluding `BigInt`) in JavaScript are all IEEE 754 floating
point.

While the included problem solvers are executing within the context of the API
server and are quick to execute, as complexity of problems and traffic increases
this may no longer be true. A possible improvement to the architecture of this
example project is to use separate workers to run computations with output
captured in the database at a future time and clients notified of or polling for
the result.

### Developer experience

Overall the project fits within the general structure of an ordinary Next.js
project, and it should be comfortable for most developers who are somewhat
familiar with Next.js. Emphasis has been placed on reducing unnecessary
departures from the structure provided by the `create-next-app` template in
order to support ease-of-use by potential future developers.

The TypeScript language was selected to provide a richer development experience
driven by types, both within the application itself and from dependencies. As it
partially provides safety through the static checking of code against its type
system, this provides developers additional confidence in the use and
modification of code. As Next.js supports TypeScript out of the box, the
compilation steps are abstracted away and handled transparently.

One problem encountered by myself during development of this project in July
2022 which may be applicable to other developers, was in the use of
AArch64-based computers, which did not impact on the application generally, but
affected tests and tooling. Use of x86-64 images in QEMU in Docker for Apple
Silicon appears to work but is significantly slower due to emulation, and
occasionally encounters odd errors such as segmentation faults - frustrating
this developer and affecting consistency of test runs.
