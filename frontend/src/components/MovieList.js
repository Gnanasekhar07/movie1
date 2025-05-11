import React, { useEffect, useState } from 'react';
import FetchMoviesBySearch from '../API/FetchMoviesBySearch';
import { isLoggedIn } from '../utils/Auth';
import Genres from './Genre';
import MovieCard from './MovieCard';
import RecommendedMovies from './RecommendedMovies';

const MovieList = ({ searchText }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genreIds, setGenreIds] = useState([]); // Added state for genreIds
  const userLoggedIn = isLoggedIn();


  useEffect(() => {
    const fetchMoviesBySearch = async () => {
      const response = await FetchMoviesBySearch(page, searchText || 'movie');
      console.log('FetchMoviesBySearch response:', response);
      if (response) {
        const { filteredMovies, totalPages } = response;
        setMovies(filteredMovies);
        setTotalPages(totalPages);
      }
    };

    fetchMoviesBySearch();
  }, [page, searchText]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className='container mx-auto px-4 py-4'>
      <Genres setGenreIds={setGenreIds} /> {/* Passed setGenreIds as prop */}
      {userLoggedIn && (
        <div>
          <RecommendedMovies />
        </div>
      )}

      <h1 className='text-left font-bold mb-4'>All Movies</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {movies.map((movie, index) => (
          <MovieCard key={movie.imdbID || movie.id} movie={movie} hallNumber={index} />
        ))}
      </div>
      <div className='flex justify-center mt-4'>
        <button
          onClick={handlePrevPage}
          className={`bg-red-500 hover:bg-red-700 text-white rounded px-3 py-1 text-sm font-semibold mx-2 my-2 cursor-pointer ${
            page === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          className={`bg-red-500 hover:bg-red-700 text-white rounded px-3 py-1 text-sm font-semibold mx-2 my-2 cursor-pointer ${
            page === totalPages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MovieList;
