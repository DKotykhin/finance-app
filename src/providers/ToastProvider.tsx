import { ToastContainer, Flip } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={6000}
      hideProgressBar
      transition={Flip}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
};
