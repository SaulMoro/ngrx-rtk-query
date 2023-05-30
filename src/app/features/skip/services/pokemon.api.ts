import { createApi, fetchBaseQuery } from 'ngrx-rtk-query';

export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query({
      // query: (name: PokemonName) => `pokemon/${name}`,
      queryFn: (name: string) => ({ data: null }),
      keepUnusedDataFor: 1,
      // keepUnusedDataFor: 0
    }),
  }),
});
