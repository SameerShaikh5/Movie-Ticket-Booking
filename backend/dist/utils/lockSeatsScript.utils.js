export const lockSeatsScript = `
    -- First check if any seat is already locked
    for i, key in ipairs(KEYS) do
        if redis.call("EXISTS", key) == 1 then
            return 0
        end
    end

    -- All seats are available, lock them
    for i, key in ipairs(KEYS) do
        redis.call("SET", key, ARGV[1], "EX", ARGV[2])
    end

    return 1
`;
