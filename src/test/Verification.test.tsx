import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Verification from '../component/Verification';
import '@testing-library/jest-dom';
import { fetchChecks, submitCheckResults } from '../api.js';

jest.mock('../api.js');
const mockFetchChecks = fetchChecks as jest.MockedFunction<typeof fetchChecks>;
mockFetchChecks.mockImplementation(() =>
  Promise.resolve([
    {
      id: 'aaa',
      priority: 10,
      description: 'Face on the picture matches face on the document',
    },
  ]),
);

test('rendering with loadig', async () => {
  await act(async () => {
    const { getByText } = render(<Verification />);
    const element = getByText('loading...');
    expect(element).toBeInTheDocument();
  });
});

test('fetching from api', async () => {
  await act(async () => {
    const { getByText, getAllByRole } = render(<Verification />);

    expect(mockFetchChecks).toHaveBeenCalled();
    await screen.findByText('Face on the picture matches face on the document');
    expect(
      getByText(/Face on the picture matches face on the document/),
    ).toBeInTheDocument();

    // 1 yes btn, 1 no btn, 1 submit
    expect(getAllByRole(/button/).length).toBe(3);

    const element = screen.queryByText('loading...');
    expect(element).toBeNull();
  });
});
