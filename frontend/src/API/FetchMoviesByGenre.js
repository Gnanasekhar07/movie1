import mockData from '../mockData/MockMovies.json';

async function FetchMoviesByGenre(ACCESS_TOKEN, page, genreIds) {
  // Using mock data instead of API call
  const filteredMovies = mockData.results.filter(
    (movie) => movie.backdrop_path !== null,
  );

  return { filteredMovies, totalPages: mockData.total_pages };
}

export default FetchMoviesByGenre;
