/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // On build, generate a self-contained directory of files required to run
    // server
    output: "standalone",
};

module.exports = nextConfig;
