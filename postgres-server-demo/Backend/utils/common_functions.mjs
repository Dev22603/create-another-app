// Common utility functions

const validatePagination = (req) => {
    const { page = 1, limit = 10 } = req.query;
    
    // Validate page and limit
    const validatedPage = Math.max(1, parseInt(page, 10) || 1);
    const validatedLimit = Math.max(1, parseInt(limit, 10) || 10);
    
    // Calculate offset
    const offset = (validatedPage - 1) * validatedLimit;
    
    return {
        page: validatedPage,
        limit: validatedLimit,
        offset
    };
};

// Format date in dd/mm/yyyy format
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
};

export { validatePagination ,formatDate};
