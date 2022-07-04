module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            version: "4.4.15",
            skipMD5: true,
        },
        instance: {},
        autoStart: false,
    },
    mongoURLEnvName: "DATABASE_URI",
};
