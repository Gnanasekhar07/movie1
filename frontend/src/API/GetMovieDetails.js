async function FetchMovieDetails(id, API_KEY) {
  try {
    console.log('Fetching movie details for id:', id);
    const response = await fetch(
      `http://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`,
    );
    const data = await response.json();
    console.log('Received movie data:', data);
    if (!data.imdbID) {
      console.warn('imdbID missing in movie data, falling back to id:', id);
      data.imdbID = id; // fallback to passed id if imdbID missing
    }
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export default FetchMovieDetails;
