import React from 'react';
import MovieSessions from '../mockData/MovieSessions';
import FormatDate from '../utils/FormatDate';
import SessionInfo from './SessionInfo';

const MovieCard = ({ movie, hallNumber }) => {
  const movieSessions = MovieSessions(movie, hallNumber);
  return (
    <div className='bg-white shadow-md rounded-lg overflow-hidden flex h-96'>
      <div className='relative w-1/2'>
        <img
          src={movie.Poster}
          alt={movie.Title || movie.title}
          className='w-full h-full object-cover'
        />
      </div>
      <div className='p-4 flex-1 flex flex-col justify-between'>
        <div>
          <h3 className='text-2xl font-semibold text-left'>{movie.title}</h3>
        </div>
        <div className='text-left text-sm'>
          <div>
            <div>
              <SessionInfo movieSessions={movieSessions} movieId={movie.imdbID} imdbID={movie.imdbID} />
            </div>
          </div>
          <div>
            <span className='text-gray-500'>
              Release Date: {FormatDate(movie.release_date)}
            </span>
          </div>
          <div>
          <span className='text-gray-500'>
              Rating: {movie.vote_average !== undefined ? movie.vote_average.toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
