import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyTickets from '../API/BuyTickets';
import getSeatPlan from '../API/GetSeatPlan';
import updateSeatsInHall from '../API/UpdateSeatsInHall';
import generateRandomOccupiedSeats from '../utils/GenerateRandomOccupiedSeats';
import SeatSelector from './SeatSelector';
import SeatShowcase from './SeatShowcase';
import { send } from '@emailjs/browser';

const movies = [
  {
    title: '',
    price: 10,
    occupied: generateRandomOccupiedSeats(1, 64, 64),
  },
];

function SeatPlan({ movie }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [recommendedSeat, setRecommendedSeat] = useState(null);
  const navigate = useNavigate();
  const [movieSession, setMovieSession] = useState(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [seatPlan, setSeatPlan] = useState(null);

  useEffect(() => {
    const storedMovieSession = JSON.parse(localStorage.getItem('movieSession'));
    if (storedMovieSession) {
      setMovieSession(storedMovieSession);
    }
  }, []);

  useEffect(() => {
    const fetchSeatPlan = async () => {
      try {
        if (movieSession && movieSession.time && movie && movie.id) {
          const data = await getSeatPlan(movie.id, movieSession);
          setSeatPlan(data);
        }
      } catch (error) {
        console.error('Error fetching seat plan:', error);
      }
    };

    if (movieSession && movie && movie.id) {
      fetchSeatPlan();
    }
  }, [movie, movieSession]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserName(storedUser.userName);
      setUserId(storedUser.userId);
      // Use the registered email address directly from storedUser.email without fallback
      setUserEmail(storedUser.email);
    }
  }, []);

  const occupiedSeats = Array.isArray(seatPlan) && seatPlan.length > 0
    ? seatPlan
    : Array.isArray(movie?.occupied)
      ? movie.occupied
      : movies[0].occupied || [];

  const availableSeats = [27, 28, 29, 30, 35, 36, 37, 38, 43, 44, 45, 46];

  const filteredAvailableSeats = availableSeats.filter(
    (seat) => !occupiedSeats.includes(seat),
  );

  useEffect(() => {
    let recommended = null;
    for (let i = 0; i < filteredAvailableSeats.length; i++) {
      const seat = filteredAvailableSeats[i];
      if (!occupiedSeats.includes(seat)) {
        recommended = seat;
        break;
      }
    }
    setRecommendedSeat(recommended);
  }, [filteredAvailableSeats, occupiedSeats]);

  if (!movie || !movie.id) {
    return (
      <div className="flex flex-col items-center p-4">
        <h2 className="text-xl font-semibold text-center text-red-600">
          Movie data is missing or incomplete. Cannot display seat plan.
        </h2>
      </div>
    );
  }

  let selectedSeatText = '';
  if (selectedSeats.length > 0) {
    selectedSeatText = selectedSeats.map((seat) => seat + 1).join(', ');
  }

  let totalPrice = selectedSeats.length * ((movie && movie.price) || movies[0].price);

  const isAnySeatSelected = selectedSeats.length > 0;

  // Function to generate a unique ticket number
  const generateTicketNumber = () => {
    return 'TICKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();
    if (!movie || !movie.id) {
      console.error('Movie or movie.id is undefined. Cannot proceed with order.');
      return;
    }
    if (isAnySeatSelected) {
      const orderSeats = selectedSeats;
      const updatedOccupiedSeats = [...orderSeats, ...occupiedSeats];

      const ticketNumber = generateTicketNumber();

      const order = {
        customerId: userId || Math.floor(Math.random() * 1000000),
        userName: userName || '',
        orderDate: new Date().toISOString(),
        seats: [...orderSeats, ...occupiedSeats],
        seat: orderSeats,
        movie: {
          id: movie.id,
          title: movie.title,
          genres: (movie.genres && Array.isArray(movie.genres)) ? movie.genres.map((genre) => genre.name).join(', ') : '',
          runtime: movie.runtime,
          language: movie.original_language,
          price: (movie && movie.price) || movies[0].price,
        },
        ticketNumber: ticketNumber,
      };

      const myOrder = {
        customerId: order.customerId,
        orderDate: order.orderDate,
        movieId: order.movie.id,
        movieTitle: order.movie.title,
        movieGenres: order.movie.genres,
        movieRuntime: order.movie.runtime,
        movieLanguage: order.movie.language,
        moviePrice: order.movie.price,
        seat: order.seat,
        userName: order.userName,
        ticketNumber: ticketNumber,
      };

      const hallUpdate = {
        movieId: movie.id,
        movieSession: movieSession.time,
        orderTime: order.orderDate,
        updatedSeats: updatedOccupiedSeats,
      };

      // Navigate to ticket display page immediately without waiting for database update
      navigate('/ticket-display', { state: myOrder });

      // Proceed to update seats in the database asynchronously
      updateSeatsInHall(BASE_URL, hallUpdate).then((updateSuccess) => {
        if (updateSuccess) {
          // Validate userEmail before sending email
          if (!userEmail || userEmail.trim() === '') {
            console.error('User email is empty. Cannot send email.');
            return;
          }

          const templateParams = {
            to_name: userName,
            to_email: userEmail,
            movie_title: order.movie.title,
            seats: selectedSeatText,
            total_price: totalPrice.toFixed(2),
            order_date: new Date(order.orderDate).toLocaleString(),
            ticket_number: ticketNumber,
          };

          console.log('Sending email with templateParams:', templateParams);

          send(
            'service_2lvc33q',
            'template_yy3wlhn',
            templateParams,
            'obWVmezkWTPwpxhF7'
          ).then((response) => {
            console.log('Email sent successfully!', response.status, response.text);
          }, (err) => {
            console.error('Failed to send email:', err);
          });
        } else {
          console.error('Failed to update occupied seats in the database');
        }
      }).catch((error) => {
        console.error('Error updating occupied seats:', error);
      });
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className='w-full md:w-1/2 lg:w-2/3 px-6'>
        <h2 className='mb-8 text-2xl font-semibold text-center'>
          Choose your seats by clicking on the available seats
        </h2>
      </div>

      <div className='CinemaPlan'>
        <SeatSelector
          movie={movie}
          selectedSeats={selectedSeats}
          recommendedSeat={recommendedSeat}
          onSelectedSeatsChange={(selectedSeats) =>
            setSelectedSeats(selectedSeats)
          }
          onRecommendedSeatChange={(recommendedSeat) =>
            setRecommendedSeat(recommendedSeat)
          }
        />
        <SeatShowcase />

        <p className='info mb-2 text-sm md:text-sm lg:text-base'>
          You have selected{' '}
          <span className='count font-semibold'>{selectedSeats.length}</span>{' '}
          seat{selectedSeats.length !== 1 ? 's' : ''}
          {selectedSeats.length === 0 ? '' : ':'}{' '}
          {selectedSeatText ? (
            <span className='selected-seats font-semibold'>
              {' '}
              {selectedSeatText}
            </span>
          ) : (
            <span></span>
          )}{' '}
          {selectedSeats.length > 0 && (
            <>
              for the price of{' '}
              <span className='total font-semibold'>{totalPrice}€</span>
            </>
          )}
        </p>

        {isAnySeatSelected ? (
          <div>
            <button
              className='bg-green-500 hover:bg-green-700 text-white rounded px-3 py-2 text-sm font-semibold cursor-pointer'
              onClick={handleButtonClick}
            >
              Buy at <span className='total font-semibold'>{totalPrice}€</span>
            </button>
          </div>
        ) : (
          <div>
            <p className='info text-sm md:text-sm lg:text-base'>
              Please select a seat
            </p>
          </div>
        )}

        {successPopupVisible && (
          <div className='bg-green-500 text-white px-4 py-2 text-sm md:text-sm lg:text-base rounded absolute bottom-1/2 mb-8 mr-8 flex justify-center'>
            Order Successful
          </div>
        )}
      </div>
    </div>
  );
}

export default SeatPlan;
