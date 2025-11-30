const REGEX = {
  EMAIL: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
};

const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  PASSWORD_MIN: 8,
};

const CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png"],
};

const ORDER = {
    STATUS: {
        PENDING: 'pending',
        SHIPPED: 'delivered',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        values: ['pending', 'delivered', 'completed', 'cancelled']
    },
    
};

export { REGEX, LIMITS, CONFIG, ORDER };
