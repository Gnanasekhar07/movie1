import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FetchMovieDetails from '../API/GetMovieDetails';
import SeatPlan from '../components/SeatPlan';

const MovieDetails = () => {
  const { movieId, imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const API_KEY = process.env.REACT_APP_API_KEY || '';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const movieData = await FetchMovieDetails(imdbID, API_KEY);
      console.log('Fetched movie data from OMDb API:', movieData);
      if (!movieData || !movieData.imdbID) {
        console.error('Movie data is null or missing imdbID:', movieData);
        setMovie(null);
        return;
      }
      if (movieData.success === false) {
        console.error('Failed to fetch movie details:', movieData.status_message);
        setMovie(null);
      } else {
        console.log('imdbID exists:', movieData.imdbID);
        setMovie(movieData);
      }
    };

    fetchData();
  }, [imdbID, API_KEY]);

  const handlePaymentNavigation = () => {
    navigate(`/payment/${movieId}`);
  };

  if (!movie) {
    return <div>Loading...</div>;
  }

  // OMDb API returns different field names, so map them accordingly
  const mappedMovie = {
    id: movie.imdbID || movie.id || movieId,
    title: movie.Title,
    overview: movie.Plot,
    genres: movie.Genre ? movie.Genre.split(',').map((g) => ({ name: g.trim() })) : [],
    tagline: movie.Tagline || '',
    runtime: movie.Runtime,
    vote_average: movie.imdbRating ? parseFloat(movie.imdbRating) : undefined,
    release_date: movie.Released,
    production_companies: [], // OMDb does not provide this
    production_countries: [], // OMDb does not provide this
    spoken_languages: [], // OMDb does not provide this
    budget: undefined,
    revenue: undefined,
    poster_path: movie.Poster,
    homepage: movie.Website && movie.Website !== 'N/A' ? movie.Website : '',
  };

  return (
    <div>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-5xl mx-auto'>
          <div className='flex flex-wrap justify-center items-start'>
            <div className='w-full md:w-1/2 lg:w-1/3 flex justify-center mb-8 md:mb-0'>
              <img
                src={mappedMovie.poster_path}
                alt={mappedMovie.title}
                className='w-full h-auto rounded'
              />
            </div>
            <div className='w-full md:w-1/2 lg:w-2/3 px-6 text-left'>
              <h2 className='text-3xl font-semibold'>{mappedMovie.title}</h2>
              <p className='text-gray-800 mt-2 text-justify text-sm md:text-sm lg:text-base'>
                {mappedMovie.overview}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Genres:</b>{' '}
                {(mappedMovie.genres && mappedMovie.genres.length > 0) ? mappedMovie.genres.map((genre) => genre.name).join(', ') : 'N/A'}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Tagline:</b> {mappedMovie.tagline || 'N/A'}
              </p>
              <p className='text-gray-800 mt-1 text-sm md:text-sm lg:text-base'>
                <b>Runtime:</b> {mappedMovie.runtime}
              </p>
              <p className='text-gray-800 mt-1 text-sm md:text-sm lg:text-base'>
                <b>Rating:</b> {mappedMovie.vote_average !== undefined ? mappedMovie.vote_average.toFixed(1) : 'N/A'}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Release Date:</b> {mappedMovie.release_date}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Production Companies:</b>{' '}
                {mappedMovie.production_companies.length > 0 ? mappedMovie.production_companies.map((company) => company.name).join(', ') : 'N/A'}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Production Countries:</b>{' '}
                {mappedMovie.production_countries.length > 0 ? mappedMovie.production_countries.map((country) => country.name).join(', ') : 'N/A'}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Spoken Languages:</b>{' '}
                {mappedMovie.spoken_languages.length > 0 ? mappedMovie.spoken_languages.map((lang) => lang.english_name).join(', ') : 'N/A'}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Budget:</b> {mappedMovie.budget !== undefined ? `$${mappedMovie.budget.toLocaleString()}` : 'N/A'}
              </p>
              <p className='text-gray-800 mt-2 text-sm md:text-sm lg:text-base'>
                <b>Revenue:</b> {mappedMovie.revenue !== undefined ? `$${mappedMovie.revenue.toLocaleString()}` : 'N/A'}
              </p>
              <a
                className='text-blue-500 mt-2 block'
                href={mappedMovie.homepage}
                target='_blank'
                rel='noopener noreferrer'
              >
                Visit Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
      <SeatPlan movie={mappedMovie} />
    </div>
  );
};

export default MovieDetails;
