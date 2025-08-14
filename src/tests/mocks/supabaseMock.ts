// src/tests/mocks/supabaseMock.ts

const createMockQueryBuilder = () => {
  const mockQueryBuilder = {
    eq: jest.fn(function() { return this; }),
    neq: jest.fn(function() { return this; }),
    limit: jest.fn(function() { return this; }),
    select: jest.fn(async function() { return { data: [], error: null }; }),
    insert: jest.fn(async function() { return { data: [], error: null }; }),
    update: jest.fn(async function() { return { data: [], error: null }; }),
    delete: jest.fn(async function() { return { data: null, error: null }; }),
  };
  return mockQueryBuilder;
};

const supabase = {
  from: jest.fn((tableName: string) => {
    return createMockQueryBuilder();
  }),
};

export const resetSupabaseMock = () => {
  supabase.from.mockClear();
  // Clear all chained mocks as well
  const mockQueryBuilder = createMockQueryBuilder(); // Create a fresh one to clear mocks
  Object.values(mockQueryBuilder).forEach((mockFn: any) => {
    if (typeof mockFn.mockClear === 'function') {
      mockFn.mockClear();
    }
  });
};

export default supabase;