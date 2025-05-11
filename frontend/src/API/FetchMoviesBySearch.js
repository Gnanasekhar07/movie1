const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY;

console.log('OMDB_API_KEY:', OMDB_API_KEY);

async function FetchMoviesBySearch(page, searchText) {
  const url = "https://www.omdbapi.com/?apikey=" + OMDB_API_KEY + "&s=" + encodeURIComponent(searchText) + "&page=" + page;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });
    const data = await response.json();

    if (data.Response === 'True' && data.Search) {
      const filteredMovies = data.Search.sort(() => 0.5 - Math.random());
      const totalPages = Math.ceil(parseInt(data.totalResults, 10) / 10);
      return { filteredMovies, totalPages };
    } else {
      return { filteredMovies: [], totalPages: 0 };
    }
  } catch (error) {
    console.error('Error fetching movies by search:', error);
    return null;
  }
}

export default FetchMoviesBySearch;
