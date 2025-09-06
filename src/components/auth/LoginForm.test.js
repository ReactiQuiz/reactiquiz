import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('submits username and password', async () => {
    const user = userEvent.setup();
    const setIdentifier = jest.fn();
    const setPassword = jest.fn();
    const onLoginSubmit = jest.fn((e) => e.preventDefault());
    render(
      <LoginForm
        formError={''}
        isSubmitting={false}
        identifier={''}
        setIdentifier={setIdentifier}
        password={''}
        setPassword={setPassword}
        onLoginSubmit={onLoginSubmit}
        accentColor={''}
      />
    );
    await user.type(screen.getByLabelText(/Username/i), 'alice');
    await user.type(screen.getByLabelText(/Password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /login/i }));
    expect(onLoginSubmit).toHaveBeenCalled();
  });
});




