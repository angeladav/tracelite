module.exports = (options) => {
    return {
        ...options,
        externals: [
            ...(options.externals || []),
            { '@prisma/client': 'commonjs @prisma/client' },
        ],
    };
};