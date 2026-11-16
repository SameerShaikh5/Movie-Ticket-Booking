export const releaseSeatsScript = `

for _, key in ipairs(KEYS) do
      redis.call('DEL', key)
  end
  return 1

`;
