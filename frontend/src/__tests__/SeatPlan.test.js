import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SeatPlan from '../components/SeatPlan';
import TicketDisplay from '../pages/TicketDisplay';

// Mock the API modules
jest.mock('../API/GetSeatPlan', () => jest.fn(() => Promise.resolve([])));
jest.mock('../API/UpdateSeatsInHall', () => jest.fn(() => Promise.resolve(true)));
jest.mock('@emailjs/browser', () => ({
  send: jest.fn(() => Promise.resolve({ status: 200, text: 'OK' })),
}));

// Mock localStorage for jsdom environment
beforeAll(() => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      clear: () => { store = {}; },
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
});

describe('SeatPlan Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('user', JSON.stringify({
      userName: 'Test User',
      userId: '123',
      email: 'testuser@example.com',
    }));
    window.localStorage.setItem('movieSession', JSON.stringify({ time: '2023-01-01T20:00:00' }));
  });

  const movie = {
    id: 1,
    title: 'Test Movie',
    price: 15,
    genres: [{ name: 'Action' }],
    runtime: 120,
    original_language: 'en',
    occupied: [],
  };

  test('renders seat plan and allows seat selection', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SeatPlan movie={movie} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Choose your seats/i)).toBeInTheDocument();

    const buyButton = screen.getByRole('button', { name: /Buy at/i });
    expect(buyButton).toBeDisabled();
  });

  test('navigates to ticket display after purchase', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SeatPlan movie={movie} />} />
          <Route path="/ticket-display" element={<TicketDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    // Additional interaction tests can be added here
  });
});

describe('TicketDisplay Component', () => {
  test('displays ticket information correctly', () => {
    const order = {
      movieTitle: 'Test Movie',
      seat: [0, 1],
      moviePrice: 15,
      orderDate: new Date().toISOString(),
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/ticket-display', state: order }]}>
        <Routes>
          <Route path="/ticket-display" element={<TicketDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Your Ticket/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Movie/i)).toBeInTheDocument();
    expect(screen.getByText(/Seats:/i)).toBeInTheDocument();
    expect(screen.getByText(/1, 2/)).toBeInTheDocument();
    expect(screen.getByText(/Total Price:/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Date:/i)).toBeInTheDocument();
  });
});
