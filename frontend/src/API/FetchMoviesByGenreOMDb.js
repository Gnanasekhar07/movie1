import axios from 'axios';

const OMDB_API_URL = 'http://www.omdbapi.com/';
const API_KEY = '7775c7d2';

async function FetchMoviesByGenreOMDb(genre, page = 1) {
  try {
    // OMDb API does not support direct genre filtering, so we search by genre keyword in title or plot
    // This is a workaround and may not be as accurate as TMDB
    const response = await axios.get(OMDB_API_URL, {
      params: {
        apikey: API_KEY,
        s: genre, // search by genre keyword
        type: 'movie',
        page: page,
      },
    });

    if (response.data && response.data.Search) {
      return {
        filteredMovies: response.data.Search,
        totalResults: parseInt(response.data.totalResults, 10),
      };
    } else {
      return {
        filteredMovies: [],
        totalResults: 0,
      };
    }
  } catch (error) {
    console.error('Error fetching movies by genre from OMDb:', error);
    return {
      filteredMovies: [],
      totalResults: 0,
    };
  }
}

export default FetchMoviesByGenreOMDb;
