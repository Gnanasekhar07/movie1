import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TicketDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">No ticket information available.</h2>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate('/')}
        >
          Go to Home
        </button>
      </div>
    );
  }

  const { movieTitle, seat, moviePrice, orderDate } = order;
  const seatText = seat && seat.length > 0 ? seat.map(s => s + 1).join(', ') : 'N/A';
  const totalPrice = (seat ? seat.length : 0) * moviePrice;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Your Ticket</h1>
      <p><strong>Movie:</strong> {movieTitle}</p>
      <p><strong>Seats:</strong> {seatText}</p>
      <p><strong>Total Price:</strong> €{totalPrice.toFixed(2)}</p>
      <p><strong>Order Date:</strong> {new Date(orderDate).toLocaleString()}</p>
      <button
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>
    </div>
  );
};

export default TicketDisplay;
