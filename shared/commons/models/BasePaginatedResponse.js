class BasePaginatedResponse {
    constructor(results, { nextCursor = null, pageSize = 0, hasMore = false }) {
        this.results = results;
        this.pagination = {
            nextCursor,
            pageSize,
            hasMore
        };
    }
}

module.exports = BasePaginatedResponse;
