import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';

describe('RegisterForm', () => {
  it('allows filling fields and submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    const noop = () => {};
    render(
      <RegisterForm
        formError={''}
        successMessage={''}
        isSubmitting={false}
        identifier={''} setIdentifier={noop}
        email={''} setEmail={noop}
        password={''} setPassword={noop}
        confirmPassword={''} setConfirmPassword={noop}
        address={''} setAddress={noop}
        userClass={''} setUserClass={noop}
        onRegisterSubmit={onSubmit}
        accentColor={''}
      />
    );
    // Use more specific selectors to avoid ambiguity
    const inputs = screen.getAllByRole('textbox');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    
    await user.type(inputs[0], 'alice'); // Username
    await user.type(inputs[1], 'a@b.com'); // Email
    await user.type(passwordInputs[0], 'secret'); // Password
    await user.type(passwordInputs[1], 'secret'); // Confirm Password
    await user.type(inputs[2], 'addr'); // Address
    await user.type(screen.getByLabelText(/Class/i), '10'); // Class
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});


